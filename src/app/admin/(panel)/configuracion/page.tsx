import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/data/settings";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Configuración"
        description="Datos de tu negocio, pagos y envíos."
      />
      <SettingsForm initial={settings} />
    </div>
  );
}
