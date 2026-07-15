"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Truck,
  Store,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Tag,
  Check,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "../cart/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import {
  previewOrderAction,
  getCheckoutSettingsAction,
  createOrderAction,
} from "@/app/actions/orders";
import {
  lookupByPhoneAction,
  myAddressesAction,
} from "@/app/actions/addresses";
import { getCustomerSessionAction } from "@/app/actions/customer-auth";
import { GoogleButton } from "../auth/google-button";
import type { PricingResult } from "@/domain/pricing";

type Settings = Awaited<ReturnType<typeof getCheckoutSettingsAction>>;
type Delivery = "ENVIO" | "RETIRO";
type Payment = "MERCADO_PAGO" | "TRANSFERENCIA" | "EFECTIVO";

export function CheckoutForm({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [nombre, setNombre] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [entrega, setEntrega] = React.useState<Delivery>("ENVIO");
  const [zona, setZona] = React.useState<string>("");
  const [pago, setPago] = React.useState<Payment>("MERCADO_PAGO");
  const [obs, setObs] = React.useState("");
  const [cupon, setCupon] = React.useState("");
  const [cuponAplicado, setCuponAplicado] = React.useState<string | null>(null);
  const [cuponError, setCuponError] = React.useState<string | null>(null);
  const [pricing, setPricing] = React.useState<PricingResult | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Sesión y Google config
  const [customerSession, setCustomerSession] = React.useState<any>(null);
  const [googleConfigured, setGoogleConfigured] = React.useState(false);

  // Direcciones guardadas y lookup
  const [savedAddresses, setSavedAddresses] = React.useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [usarNuevaDireccion, setUsarNuevaDireccion] = React.useState(true);
  const [guardarDireccion, setGuardarDireccion] = React.useState(false);
  const [etiquetaDireccion, setEtiquetaDireccion] = React.useState("Casa");
  const [entregaDatos, setEntregaDatos] = React.useState<Record<string, string>>({});
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);

  // Fecha y hora de programación
  const [cuando, setCuando] = React.useState<"ASAP" | "PROGRAMADO">("ASAP");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");

  const cartItems = React.useMemo(
    () => items.map((i) => ({ productId: i.productId, cantidad: i.cantidad })),
    [items],
  );

  React.useEffect(() => {
    getCheckoutSettingsAction().then((s) => {
      setSettings(s);
      setZona(s.zonas[0]?.nombre ?? "");
    });

    getCustomerSessionAction().then((res) => {
      setCustomerSession(res.session);
      setGoogleConfigured(res.googleConfigured);
      if (res.session) {
        setNombre(res.session.nombre ?? "");
        setEmail(res.session.email ?? "");
        
        myAddressesAction()
          .then((addrs) => {
            if (addrs.length > 0) {
              setSavedAddresses(addrs);
              const pred = addrs.find((a: any) => a.esPredeterminada) || addrs[0];
              setSelectedAddressId(pred.id);
              setUsarNuevaDireccion(false);
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  React.useEffect(() => {
    const cleanTel = telefono.trim();
    if (cleanTel.length < 6) return;
    
    const t = setTimeout(async () => {
      setLoadingAddresses(true);
      try {
        const res = await lookupByPhoneAction(cleanTel);
        if (res.reconocido) {
          if (!nombre && res.nombre) setNombre(res.nombre);
          if (res.direcciones.length > 0) {
            setSavedAddresses(res.direcciones);
            if (!selectedAddressId) {
              const pred = res.direcciones.find((d: any) => d.esPredeterminada) || res.direcciones[0];
              setSelectedAddressId(pred.id);
              setUsarNuevaDireccion(false);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAddresses(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [telefono, nombre, selectedAddressId]);

  // Preview de totales en vivo (debounced).
  React.useEffect(() => {
    if (cartItems.length === 0) return;
    const t = setTimeout(async () => {
      const res = await previewOrderAction({
        items: cartItems,
        metodoEntrega: entrega,
        zona,
        cupon: cuponAplicado ?? undefined,
      });
      if (res) {
        setPricing(res.pricing);
        if (cuponAplicado) {
          setCuponError(res.cuponError);
          if (res.cuponError) setCuponAplicado(null);
        }
      }
    }, 250);
    return () => clearTimeout(t);
  }, [cartItems, entrega, zona, cuponAplicado]);

  function aplicarCupon() {
    const code = cupon.trim().toUpperCase();
    if (!code) return;
    setCuponError(null);
    setCuponAplicado(code);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (nombre.trim().length < 2) return toast.error("Ingresá tu nombre.");
    if (telefono.trim().length < 6)
      return toast.error("Ingresá un teléfono válido.");

    if (entrega === "ENVIO") {
      if (usarNuevaDireccion) {
        const obligatorios = settings?.camposEntrega.filter(
          (c) => !c.fijo && c.visibilidad === "OBLIGATORIO"
        );
        for (const c of obligatorios ?? []) {
          const val = (entregaDatos[c.key] ?? "").trim();
          if (!val) {
            return toast.error(`El campo "${c.label}" es obligatorio.`);
          }
        }
      } else {
        if (!selectedAddressId) {
          return toast.error("Seleccioná una dirección o cargá una nueva.");
        }
      }
    }

    if (cuando === "PROGRAMADO") {
      if (!selectedDate || !selectedTime) {
        return toast.error("Seleccioná fecha y hora para programar la entrega.");
      }
    }

    let fechaEntregaISO: string | null = null;
    if (cuando === "PROGRAMADO" && selectedDate && selectedTime) {
      const d = new Date(selectedDate);
      const [hh, mm] = selectedTime.split(":");
      d.setHours(Number(hh), Number(mm), 0, 0);
      fechaEntregaISO = d.toISOString();
    }

    setSubmitting(true);
    try {
      const res = await createOrderAction({
        cliente: { nombre, telefono, email },
        metodoEntrega: entrega,
        zona: entrega === "ENVIO" ? zona : undefined,
        entregaDatos: entrega === "ENVIO" && usarNuevaDireccion ? entregaDatos : undefined,
        addressId: entrega === "ENVIO" && !usarNuevaDireccion ? (selectedAddressId ?? undefined) : undefined,
        guardarDireccion: entrega === "ENVIO" && usarNuevaDireccion ? guardarDireccion : undefined,
        etiquetaDireccion: entrega === "ENVIO" && usarNuevaDireccion && guardarDireccion ? etiquetaDireccion : undefined,
        metodoPago: pago,
        observaciones: obs,
        cupon: cuponAplicado ?? undefined,
        cuando,
        fechaEntrega: fechaEntregaISO,
        items: cartItems,
      });

      if (!res.ok) {
        toast.error(res.error);
        setSubmitting(false);
        return;
      }

      clear();
      onDone();
      if (res.redirectUrl.startsWith("http")) {
        window.location.href = res.redirectUrl;
      } else {
        router.push(res.redirectUrl);
      }
    } catch {
      toast.error("No pudimos procesar el pedido. Probá de nuevo.");
      setSubmitting(false);
    }
  }

  const total = pricing?.total ?? 0;
  const payLabel =
    pago === "MERCADO_PAGO"
      ? "Pagar con Mercado Pago"
      : pago === "TRANSFERENCIA"
        ? "Confirmar pedido"
        : "Confirmar pedido";

  return (
    <form onSubmit={submit} className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-cocoa"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al carrito
      </button>

      {/* Google login helper */}
      {!customerSession && googleConfigured && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-cream/40 p-4 space-y-3">
          <p className="text-xs text-cocoa-soft text-center font-medium">
            ¿Tenés una cuenta? Iniciá sesión para usar tus direcciones guardadas.
          </p>
          <GoogleButton label="Autocompletar con Google" />
        </div>
      )}

      {/* Datos */}
      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-semibold text-cocoa">
          Tus datos
        </legend>
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre y apellido</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Sofía González"
            autoComplete="name"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tel">Teléfono / WhatsApp</Label>
            <div className="relative">
              <Input
                id="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 2281 40-0000"
                inputMode="tel"
                autoComplete="tel"
                required
              />
              {loadingAddresses && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted" />
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Para tu comprobante"
              type="email"
              autoComplete="email"
            />
          </div>
        </div>
      </fieldset>

      {/* Entrega */}
      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-semibold text-cocoa">Entrega</legend>
        <div className="grid grid-cols-2 gap-2">
          <SegBtn
            active={entrega === "ENVIO"}
            onClick={() => setEntrega("ENVIO")}
            icon={<Truck className="h-4 w-4" />}
            label="Envío"
          />
          <SegBtn
            active={entrega === "RETIRO"}
            onClick={() => setEntrega("RETIRO")}
            icon={<Store className="h-4 w-4" />}
            label="Retiro"
            disabled={settings ? !settings.retiroDisponible : false}
          />
        </div>

        {entrega === "ENVIO" && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label>Zona de reparto</Label>
              <Select value={zona} onValueChange={setZona}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí tu zona" />
                </SelectTrigger>
                <SelectContent>
                  {settings?.zonas.map((z) => (
                    <SelectItem key={z.nombre} value={z.nombre}>
                      {z.nombre} · {formatPrice(z.costo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Libreta de direcciones */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <Label>Dirección de envío</Label>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[var(--radius-md)] border cursor-pointer transition-all",
                        selectedAddressId === addr.id && !usarNuevaDireccion
                          ? "border-caramel bg-caramel/10 text-caramel-deep shadow-[0_0_0_1px_var(--caramel)]"
                          : "border-border text-cocoa hover:bg-cream-2"
                      )}
                    >
                      <input
                        type="radio"
                        name="addressSelect"
                        checked={selectedAddressId === addr.id && !usarNuevaDireccion}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setUsarNuevaDireccion(false);
                        }}
                        className="text-caramel focus:ring-caramel"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold uppercase tracking-wider block">
                          {addr.etiqueta} {addr.esPredeterminada && "· Predeterminada"}
                        </span>
                        <span className="text-sm block truncate">{addr.resumen}</span>
                      </div>
                    </label>
                  ))}
                  <label
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-[var(--radius-md)] border cursor-pointer transition-all",
                      usarNuevaDireccion
                        ? "border-caramel bg-caramel/10 text-caramel-deep shadow-[0_0_0_1px_var(--caramel)]"
                        : "border-border text-cocoa hover:bg-cream-2"
                    )}
                  >
                    <input
                      type="radio"
                      name="addressSelect"
                      checked={usarNuevaDireccion}
                      onChange={() => {
                        setSelectedAddressId(null);
                        setUsarNuevaDireccion(true);
                      }}
                      className="text-caramel focus:ring-caramel"
                    />
                    <span className="text-sm font-medium text-cocoa-soft">
                      + Agregar otra dirección
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Formulario Dinámico */}
            {usarNuevaDireccion && settings && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
                {settings.camposEntrega
                  .filter((c) => !c.fijo && c.visibilidad !== "OCULTO")
                  .map((c) => (
                    <div key={c.key} className={getFieldColSpanClass(c.key)}>
                      <Label htmlFor={`field-${c.key}`}>
                        {c.label} {c.visibilidad === "OBLIGATORIO" && <span className="text-danger">*</span>}
                      </Label>
                      <Input
                        id={`field-${c.key}`}
                        value={entregaDatos[c.key] ?? ""}
                        onChange={(e) =>
                          setEntregaDatos((prev) => ({ ...prev, [c.key]: e.target.value }))
                        }
                        placeholder={c.label}
                        required={c.visibilidad === "OBLIGATORIO"}
                      />
                    </div>
                  ))}
              </div>
            )}

            {/* Guardar dirección */}
            {usarNuevaDireccion && (
              <div className="space-y-3 pt-2 border-t border-dashed border-border mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardarDireccion}
                    onChange={(e) => setGuardarDireccion(e.target.checked)}
                    className="rounded border-border text-caramel focus:ring-caramel"
                  />
                  <span className="text-sm text-cocoa-soft">
                    Guardar esta dirección para futuras compras
                  </span>
                </label>
                {guardarDireccion && (
                  <div className="space-y-1.5 max-w-xs">
                    <Label htmlFor="etiquetaDir">Nombre de la dirección</Label>
                    <Input
                      id="etiquetaDir"
                      value={etiquetaDireccion}
                      onChange={(e) => setEtiquetaDireccion(e.target.value)}
                      placeholder="Ej: Casa, Trabajo, Novio/a"
                      required
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {entrega === "RETIRO" && settings && (
          <div className="rounded-[var(--radius-lg)] border border-border bg-cream-2/40 p-4 space-y-3 text-sm text-cocoa-soft">
            <p>
              📍 <strong>Dirección del local:</strong> {settings.direccionLocal}
            </p>
            <p>
              🕒 <strong>Horarios de retiro:</strong> {settings.horariosRetiro}
            </p>
            <p className="text-xs text-muted italic">
              {settings.direccionRetiro}
            </p>
            {settings.localLat && settings.localLng && (
              <div className="pt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${settings.localLat},${settings.localLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-caramel-deep hover:underline inline-flex items-center gap-1"
                >
                  🗺️ Ver en Google Maps
                </a>
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Programar entrega */}
      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-semibold text-cocoa">¿Cuándo lo querés?</legend>
        <div className="grid grid-cols-2 gap-2">
          <SegBtn
            active={cuando === "ASAP"}
            onClick={() => setCuando("ASAP")}
            icon={<Clock className="h-4 w-4" />}
            label="Lo antes posible (ASAP)"
          />
          <SegBtn
            active={cuando === "PROGRAMADO"}
            onClick={() => setCuando("PROGRAMADO")}
            icon={<CalendarDays className="h-4 w-4" />}
            label="Programar entrega"
          />
        </div>
        {cuando === "PROGRAMADO" && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná día" />
                </SelectTrigger>
                <SelectContent>
                  {getDateOptions().map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Hora</Label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={!selectedDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedDate ? "Seleccioná hora" : "Elegí día primero"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedDate &&
                    getTimeSlots(selectedDate).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t} hs
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </fieldset>

      {/* Pago */}
      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-semibold text-cocoa">Pago</legend>
        <div className="grid grid-cols-3 gap-2">
          <SegBtn
            active={pago === "MERCADO_PAGO"}
            onClick={() => setPago("MERCADO_PAGO")}
            icon={<CreditCard className="h-4 w-4" />}
            label="Mercado Pago"
            stacked
          />
          <SegBtn
            active={pago === "TRANSFERENCIA"}
            onClick={() => setPago("TRANSFERENCIA")}
            icon={<ArrowLeftRight className="h-4 w-4" />}
            label="Transferencia"
            stacked
          />
          <SegBtn
            active={pago === "EFECTIVO"}
            onClick={() => setPago("EFECTIVO")}
            icon={<Banknote className="h-4 w-4" />}
            label="Efectivo"
            stacked
          />
        </div>
        {pago === "TRANSFERENCIA" && settings && (
          <div className="rounded-[var(--radius-md)] bg-cream-2 px-3 py-2.5 text-sm text-cocoa-soft">
            <p>
              Alias: <strong className="text-cocoa">{settings.aliasTransferencia}</strong>
            </p>
            <p>Titular: {settings.titularCuenta}</p>
            <p className="mt-1 text-xs">
              Coordinás el envío del comprobante por WhatsApp al confirmar.
            </p>
          </div>
        )}
        {pago === "EFECTIVO" && (
          <p className="rounded-[var(--radius-md)] bg-cream-2 px-3 py-2.5 text-sm text-cocoa-soft">
            Pagás en efectivo al recibir o retirar tu pedido.
          </p>
        )}
      </fieldset>

      {/* Observaciones */}
      <div className="space-y-1.5">
        <Label htmlFor="obs">Observaciones (opcional)</Label>
        <Textarea
          id="obs"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Sin nueces, feliz cumple Marto, etc."
        />
      </div>

      {/* Cupón */}
      <div className="space-y-1.5">
        <Label htmlFor="cupon">Cupón de descuento</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="cupon"
              value={cupon}
              onChange={(e) => setCupon(e.target.value.toUpperCase())}
              placeholder="BIENVENIDA10"
              className="pl-9 uppercase"
              disabled={!!cuponAplicado}
            />
          </div>
          {cuponAplicado ? (
            <button
              type="button"
              onClick={() => {
                setCuponAplicado(null);
                setCupon("");
                setCuponError(null);
              }}
              className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-md)] bg-success/12 px-4 text-sm font-medium text-success"
            >
              <Check className="h-4 w-4" /> Aplicado
            </button>
          ) : (
            <button
              type="button"
              onClick={aplicarCupon}
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-4 text-sm font-medium text-cocoa transition-colors hover:bg-cream-2"
            >
              Aplicar
            </button>
          )}
        </div>
        {cuponError && <p className="text-xs text-danger">{cuponError}</p>}
      </div>

      {/* Resumen */}
      <div className="space-y-1.5 rounded-[var(--radius-md)] border border-border bg-cream/50 p-4 text-sm">
        <Row label="Subtotal" value={formatPrice(pricing?.subtotal ?? 0)} />
        {pricing?.descuentos.map((d) => (
          <Row
            key={d.etiqueta}
            label={d.etiqueta}
            value={`- ${formatPrice(d.monto)}`}
            accent="success"
          />
        ))}
        <Row
          label="Envío"
          value={
            entrega === "RETIRO"
              ? "Retiro"
              : pricing?.costoEnvio === 0
                ? "Gratis"
                : formatPrice(pricing?.costoEnvio ?? 0)
          }
        />
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
          <span className="font-semibold text-cocoa">Total</span>
          <span className="font-display text-xl font-bold text-cocoa">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !pricing || total <= 0}
        className="flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-full bg-caramel py-3.5 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-8px_rgba(197,123,44,0.8)] transition-all hover:bg-caramel-deep active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Procesando…
          </>
        ) : (
          <>
            {pago === "MERCADO_PAGO" && <CreditCard className="h-5 w-5" />}
            {payLabel} · {formatPrice(total)}
          </>
        )}
      </button>
      <p className="text-center text-xs text-muted">
        Al confirmar aceptás ser contactado por WhatsApp para coordinar la entrega.
      </p>
    </form>
  );
}

function SegBtn({
  active,
  onClick,
  icon,
  label,
  disabled,
  stacked,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  stacked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-medium transition-all disabled:opacity-40",
        stacked && "flex-col gap-1 text-xs",
        active
          ? "border-caramel bg-caramel/10 text-caramel-deep shadow-[0_0_0_1px_var(--caramel)]"
          : "border-border text-cocoa-soft hover:bg-cream-2",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span
        className={cn(
          "font-medium",
          accent === "success" ? "text-success" : "text-cocoa",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function getFieldColSpanClass(key: string): string {
  if (key === "calle") return "col-span-2 sm:col-span-3";
  if (key === "numero") return "col-span-1";
  if (key === "piso" || key === "departamento") return "col-span-1";
  if (key === "barrio" || key === "ciudad") return "col-span-2 sm:col-span-2";
  return "col-span-2 sm:col-span-4";
}

function getDateOptions() {
  const options = [];
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    
    if (d.getDay() === 1) continue; 
    
    const isToday = i === 0;
    const isTomorrow = i === 1;
    
    let label = "";
    if (isToday) label = "Hoy";
    else if (isTomorrow) label = "Mañana";
    else label = `${days[d.getDay()]} ${d.getDate()}/${months[d.getMonth()]}`;
    
    options.push({
      value: d.toISOString().split("T")[0],
      label,
    });
  }
  return options;
}

function getTimeSlots(selectedDateStr: string) {
  const slots = [];
  const now = new Date();
  const startHour = 10;
  const endHour = 20;
  
  const isToday = selectedDateStr === now.toISOString().split("T")[0];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (const min of [0, 30]) {
      if (hour === endHour && min > 0) break;
      
      const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      
      if (isToday) {
        const slotTime = new Date();
        slotTime.setHours(hour, min, 0, 0);
        if (slotTime.getTime() - now.getTime() < 60 * 60_000) {
          continue;
        }
      }
      slots.push(timeStr);
    }
  }
  return slots;
}
