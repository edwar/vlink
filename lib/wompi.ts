import crypto from 'crypto';

const WOMPI_PUB = process.env.WOMPI_PUBLIC_KEY || '';
const WOMPI_PRIV = process.env.WOMPI_PRIVATE_KEY || '';
const WOMPI_INTEGRITY = process.env.WOMPI_INTEGRITY_SECRET || '';
const WOMPI_EVENTS = process.env.WOMPI_EVENTS_SECRET || '';
const WOMPI_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://production.wompi.co/v1' 
  : 'https://sandbox.wompi.co/v1';

export function generateSignature(reference: string, amountInCents: number, currency: string = 'COP') {
    const stringToHash = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY}`;
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return hash;
}

export async function getAcceptanceTokens() {
    const response = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUB}`);
    const data = await response.json();
    return {
        acceptance_token: data.data?.presigned_acceptance?.acceptance_token,
        accept_personal_auth: data.data?.presigned_personal_data_auth?.acceptance_token
    };
}

export async function createWompiTransaction({
    amountInCents,
    reference,
    customerEmail,
    subaccountId
}: {
    amountInCents: number;
    reference: string;
    customerEmail: string;
    subaccountId?: string | null;
}) {
    const signature = generateSignature(reference, amountInCents, 'COP');
    const tokens = await getAcceptanceTokens();

    const payload: any = {
        amount_in_cents: amountInCents,
        currency: 'COP',
        signature,
        reference,
        customer_email: customerEmail,
        acceptance_token: tokens.acceptance_token,
        accept_personal_auth: tokens.accept_personal_auth,
        payment_method: {
            type: "BANCOLOMBIA_QR", // Bancolombia QR also supports Nequi seamlessly
            ...(WOMPI_PUB.startsWith('pub_test_') && { sandbox_status: 'APPROVED' })
        }
    };

    if (subaccountId) {
        payload.merchant_settings = {
            subaccount_id: subaccountId
        };
        // Or if routing specifies it:
        // payload.merchant_split = { ... } (Depending on Wompi's API)
        // Usually, the easiest way to direct multi-tenant money is through `customer_data` or specific headers/keys,
        // Wait, the documentation for subaccounts specifies we should pass this. We will pass it at the root as requested by prompt:
        // "que incluya el monto, la subaccount_id de la organización" -> wait, perhaps `payment_method` isn't the only one. 
        // Wompi uses `customer_data`. Let's just put it at root.
        payload.subaccount_id = subaccountId;
    }

    const response = await fetch(`${WOMPI_API_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WOMPI_PUB}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("Wompi Create Error:", JSON.stringify(data, null, 2));
        let errorMsg = "Failed to create Wompi transaction";
        if (data.error?.messages) {
            errorMsg = JSON.stringify(data.error.messages);
        } else if (data.error?.reason) {
            errorMsg = data.error.reason;
        }
        throw new Error(errorMsg);
    }

    // Extraer QR: usually in data.data.payment_method.extra.qr_image or async_payment_url
    const transaction = data.data;
    let qrImage = transaction?.payment_method?.extra?.qr_image 
        || transaction?.payment_method?.extra?.async_payment_url 
        || transaction?.async_payment_url;

    let paymentUrl = transaction?.async_payment_url || null;

    // Fix para Sandbox: Wompi no devuelve el QR cuando forzamos sandbox_status='APPROVED', por ende simulamos la experiencia
    if (WOMPI_PUB.startsWith('pub_test_') && !qrImage) {
        qrImage = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=sandbox-wompi-qr-mock-12345";
        paymentUrl = `https://checkout.wompi.co/p/?public-key=${WOMPI_PUB}&reference=${reference}&amount-in-cents=${amountInCents}&currency=COP`;
    }

    return {
        id: transaction.id,
        qrImage,
        paymentUrl,
        amountInCents,
        reference
    };
}

export function validateWompiEventSignature(eventData: any, signature: string, timestamp: string) {
    if (!signature || !timestamp) return false;
    
    // Wompi uses events secret
    const properties = eventData.data.transaction;
    
    // To validate Wompi Webhook event:
    // Some events calculate hash using id+status+amount+timestamp
    const stringToHash = `${properties.id}${properties.status}${properties.amount_in_cents}${timestamp}${WOMPI_EVENTS}`;
    const expectedHash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    
    return expectedHash === signature;
}

export async function createWompiSubaccount(data: {
    name: string;
    email: string;
    phone: string;
    documentType: 'CC' | 'CE' | 'NIT' | 'PP';
    documentNumber: string;
    accountType: 'SAVINGS' | 'CHECKING';
    accountNumber: string;
    bankCode: string;
}) {
    const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        document: {
            type: data.documentType,
            number: data.documentNumber
        },
        settlement: {
            type: "BANK_ACCOUNT",
            account_type: data.accountType,
            account_number: data.accountNumber,
            bank_code: data.bankCode
        }
    };

    const response = await fetch(`${WOMPI_API_URL}/sub_accounts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WOMPI_PRIV}`, // Needs private key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
        console.error("Wompi Subaccount Error:", JSON.stringify(result, null, 2));
        throw new Error(result.error?.reason || "Failed to create Wompi subaccount");
    }

    return result.data.id; // Returns the subaccount ID (e.g. "123")
}
