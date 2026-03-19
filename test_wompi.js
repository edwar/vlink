const crypto = require('crypto');

async function testWompi() {
    const pubKey = "pub_test_zYd1INBf3HYfcCZdeabaA6jZe5THZcTr";
    const integrity = "test_integrity_JWJhIwXJEaP28CTZsEtsD0fhQu1K7ym6";
    const resMerch = await fetch(`https://sandbox.wompi.co/v1/merchants/${pubKey}`);
    const dataMerch = await resMerch.json();

    const tkn = dataMerch.data.presigned_acceptance.acceptance_token;
    const personal = dataMerch.data.presigned_personal_data_auth.acceptance_token;

    const reference = "refs-" + Date.now();
    const amountInCents = 1500000;
    
    const stringToHash = `${reference}${amountInCents}COP${integrity}`;
    const signature = crypto.createHash('sha256').update(stringToHash).digest('hex');

    const res = await fetch("https://sandbox.wompi.co/v1/transactions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + pubKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            amount_in_cents: amountInCents,
            currency: "COP",
            customer_email: "test@test.com",
            acceptance_token: tkn,
            accept_personal_auth: personal,
            reference: reference,
            signature: signature,
            payment_method: {
                type: "BANCOLOMBIA_QR",
                sandbox_status: "APPROVED"
            }
        })
    });
    const result = await res.json();
    console.log(JSON.stringify(result, null, 2));
}

testWompi();
