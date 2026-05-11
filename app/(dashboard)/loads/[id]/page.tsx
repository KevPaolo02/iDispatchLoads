import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteLoadAction,
  unassignLoadAction,
  updateDriverLoadStatusAction,
  updateLoadAction,
} from "@/app/(dashboard)/actions";
import { ConfirmForm } from "@/components/confirm-form";
import { FlashBanner } from "@/components/flash-banner";
import { LoadForm } from "@/components/load-form";
import { MatchCard } from "@/components/match-card";
import { OfferCard } from "@/components/offer-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getLoadDetail, getLoadPhotos } from "@/lib/data";
import { formatCurrency, formatDate, normalizeArray, routeLabel } from "@/lib/utils";

export default async function LoadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = normalizeArray(resolvedSearchParams.error)[0];
  const success = normalizeArray(resolvedSearchParams.success)[0];

  try {
    const [{ load }, photos] = await Promise.all([
      getLoadDetail(resolvedParams.id),
      getLoadPhotos(resolvedParams.id),
    ]);
    const pendingOffers = load.offers.filter((offer) => offer.status === "pending");
    const pickupPhotos = photos.filter((p) => p.stage === "pickup");
    const deliveryPhotos = photos.filter((p) => p.stage === "delivery");

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-sky-300 transition hover:text-sky-200">
              Back to board
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-white">{routeLabel(load)}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Pickup {formatDate(load.pickup_date)} · {load.vehicle_type} · {formatCurrency(load.price)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={load.status} />
            {load.driver_status ? <StatusBadge status={load.driver_status} /> : null}
          </div>
        </div>

        {error ? <FlashBanner type="error" message={error} /> : null}
        {success ? <FlashBanner type="success" message={success} /> : null}

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard
            title="Edit Load"
            description={
              load.status === "NEW"
                ? "Edit any field. Status changes through offers, assignment, or Unassign."
                : "Notes are editable. Use Unassign to roll the load back to NEW before changing route or price."
            }
          >
            <LoadForm
              action={updateLoadAction}
              submitLabel="Update load"
              returnTo={`/loads/${load.id}`}
              load={load}
              lockCoreFields={load.status !== "NEW"}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {load.status !== "NEW" && load.status !== "COMPLETED" ? (
                <ConfirmForm
                  action={unassignLoadAction}
                  confirmMessage="Unassign this load? Pending and accepted offers will be rejected and the load will return to NEW."
                >
                  <input type="hidden" name="load_id" value={load.id} />
                  <input type="hidden" name="return_to" value={`/loads/${load.id}`} />
                  <button className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20">
                    Unassign load
                  </button>
                </ConfirmForm>
              ) : null}

              {load.status === "NEW" && load.offers.length === 0 ? (
                <ConfirmForm
                  action={deleteLoadAction}
                  confirmMessage="Delete this load? This cannot be undone."
                >
                  <input type="hidden" name="id" value={load.id} />
                  <input type="hidden" name="return_to" value="/" />
                  <button className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20">
                    Delete load
                  </button>
                </ConfirmForm>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            title="Assignment"
            description="See who owns the load, what was agreed, and current trip progress."
          >
            {load.driver ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Assigned driver</p>
                  <p className="mt-2 text-xl font-semibold text-white">{load.driver.name}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {load.driver.current_location} · {load.driver.trailer_type}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Agreed price {formatCurrency(load.agreed_price ?? load.price)}
                  </p>
                </div>

                <form action={updateDriverLoadStatusAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="load_id" value={load.id} />
                  <input type="hidden" name="return_to" value={`/loads/${load.id}`} />
                  <button
                    name="driver_status"
                    value="en_route"
                    className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
                  >
                    Mark en route
                  </button>
                  <button
                    name="driver_status"
                    value="picked_up"
                    className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20"
                  >
                    Mark picked up
                  </button>
                  <button
                    name="driver_status"
                    value="delivered"
                    className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                  >
                    Mark delivered
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                No driver assigned yet. Use the ranked list below to send an offer or assign directly.
              </div>
            )}

            {load.notes ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {load.notes}
              </div>
            ) : null}
          </SectionCard>
        </section>

        <SectionCard
          title="Photos"
          description={`Pickup: ${pickupPhotos.length} · Delivery: ${deliveryPhotos.length}. Drivers upload from the /driver view; signed URLs valid for 24 hours.`}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <PhotoGroup label="Pickup" photos={pickupPhotos} />
            <PhotoGroup label="Delivery" photos={deliveryPhotos} />
          </div>
        </SectionCard>

        <SectionCard
          title="Ranked Driver Matches"
          description="Simple rule-based matching ranked by availability, lane fit, and trailer compatibility."
        >
          <div className="space-y-4">
            {load.status === "COMPLETED" ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                This load is completed, so matching and new offers are locked.
              </p>
            ) : load.matches.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                No available drivers match the current lane and equipment.
              </p>
            ) : (
              load.matches.map((match) => <MatchCard key={match.driver.id} load={load} match={match} returnTo={`/loads/${load.id}`} />)
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Offers"
          description={`${pendingOffers.length} pending offers on this load.`}
        >
          <div className="space-y-4">
            {load.offers.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                No offers have been sent yet.
              </p>
            ) : (
              load.offers.map((offer) => <OfferCard key={offer.id} offer={offer} returnTo={`/loads/${load.id}`} />)
            )}
          </div>
        </SectionCard>
      </div>
    );
  } catch {
    notFound();
  }
}

type PhotoGroupProps = {
  label: string;
  photos: Array<{ id: string; signed_url: string | null; uploaded_at: string }>;
};

function PhotoGroup({ label, photos }: PhotoGroupProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
          {photos.length}
        </span>
      </div>

      {photos.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
          No {label.toLowerCase()} photos uploaded yet.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) =>
            photo.signed_url ? (
              <a
                key={photo.id}
                href={photo.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-xl border border-white/10 bg-slate-950 transition hover:border-sky-400/40"
                title={new Date(photo.uploaded_at).toLocaleString()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.signed_url}
                  alt={`${label} photo`}
                  className="aspect-square w-full object-cover"
                />
              </a>
            ) : (
              <div
                key={photo.id}
                className="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-slate-950/60 text-xs text-slate-500"
              >
                URL expired
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
