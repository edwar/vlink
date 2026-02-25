import { ProfileSettings } from "@/components/profile-settings";

export default function PerfilPage() {
    return (
        <div className="space-y-10">
            <header className="space-y-2">
                <h1 className="text-4xl font-display font-black tracking-tight text-primary">Mi Perfil</h1>
                <p className="text-lg text-muted-foreground font-medium">Gestiona tu identidad pública y la conexión con tus calendarios.</p>
            </header>

            <ProfileSettings />
        </div>
    );
}
