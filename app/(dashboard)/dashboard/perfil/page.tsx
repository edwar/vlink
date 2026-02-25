import { ProfileSettings } from "@/components/profile-settings";

export default function PerfilPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-display font-bold text-primary">Mi Perfil</h1>
                <p className="text-muted-foreground">Gestiona tu identidad pública y la conexión con tus calendarios.</p>
            </header>

            <ProfileSettings />
        </div>
    );
}
