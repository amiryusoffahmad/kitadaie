"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DetailField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground">{value || "-"}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

export function RecordDetailDialog({ record, open, onOpenChange }) {
  if (!record) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Record Details
            <Badge variant="outline">ID: {record.id}</Badge>
          </DialogTitle>
          <DialogDescription>
            Complete information for {record.mutarobbi_name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Murobbi Information */}
            <Section title="Murobbi Information">
              <DetailField label="Name" value={record.murobbi_name} />
              <DetailField label="Email" value={record.murobbi_email} />
              <DetailField label="Branch" value={record.murobbi_branch} />
              <DetailField
                label="Tahun Ditarbiyah"
                value={record.tahun_ditarbiyah}
              />
              <DetailField
                label="Tahun Membina"
                value={record.tahun_membina}
              />
              <DetailField
                label="Tempoh Membina"
                value={`${record.tempoh_membina} tahun`}
              />
              <DetailField
                label="Bilangan Mutarobbi"
                value={record.bilangan_mutarobbi}
              />
              <DetailField
                label="Tahapan Murobbi"
                value={record.tahapan_murobbi}
              />
            </Section>

            <Separator />

            {/* Mutarobbi Information */}
            <Section title="Mutarobbi Information">
              <DetailField label="Name" value={record.mutarobbi_name} />
              <DetailField label="Gender" value={record.mutarobbi_gender} />
              <DetailField
                label="Category"
                value={record.mutarobbi_category}
              />
              <DetailField label="Status" value={record.mutarobbi_status} />
              <DetailField
                label="Kenal Tarbiyah"
                value={record.kenal_tarbiyah}
              />
              {record.kenal_tarbiyah_other && (
                <DetailField
                  label="Kenal Tarbiyah (Other)"
                  value={record.kenal_tarbiyah_other}
                />
              )}
              <DetailField
                label="Tarikh Mufaraqah"
                value={formatDate(record.tarikh_mufaraqah)}
              />
              <DetailField
                label="Masa Mufaraqah"
                value={formatTime(record.masa_mufaraqah)}
              />
              <DetailField
                label="Umur Tarbiyah"
                value={`${record.umur_tarbiyah} tahun`}
              />
            </Section>

            <Separator />

            {/* Education Information */}
            <Section title="Education Information">
              <DetailField label="Kampus" value={record.kampus_mutarobbi} />
              {record.kampus_mutarobbi_other && (
                <DetailField
                  label="Kampus (Other)"
                  value={record.kampus_mutarobbi_other}
                />
              )}
              <DetailField
                label="Tahap Pendidikan"
                value={record.tahap_pendidikan}
              />
              {record.tahap_pendidikan_other && (
                <DetailField
                  label="Tahap Pendidikan (Other)"
                  value={record.tahap_pendidikan_other}
                />
              )}
              <DetailField
                label="Tahun Pengajian"
                value={record.tahun_pengajian}
              />
              {record.tahun_pengajian_other && (
                <DetailField
                  label="Tahun Pengajian (Other)"
                  value={record.tahun_pengajian_other}
                />
              )}
              <DetailField label="Kursus" value={record.kursus_mutarobbi} />
              <DetailField label="Level" value={record.level_mutarobbi} />
            </Section>

            <Separator />

            {/* Cluster Information */}
            <Section title="Cluster Information">
              <DetailField label="Sebab Utama" value={record.sebab_utama} />
              <DetailField label="Sub Kluster" value={record.sub_kluster} />
              <div className="md:col-span-2">
                <DetailField
                  label="Keterangan Kluster"
                  value={record.keterangan_kluster}
                />
              </div>
              <DetailField
                label="Tambah Kluster"
                value={record.tambah_kluster}
              />
              {record.tambah_kluster === "Ya" && (
                <>
                  <DetailField
                    label="Sebab Tambahan"
                    value={record.sebab_tambahan}
                  />
                  <DetailField
                    label="Sub Kluster 2"
                    value={record.sub_kluster_2}
                  />
                  <div className="md:col-span-2">
                    <DetailField
                      label="Keterangan Tambahan"
                      value={record.keterangan_tambahan}
                    />
                  </div>
                </>
              )}
            </Section>

            <Separator />

            {/* Additional Information */}
            <Section title="Additional Information">
              <DetailField label="KitaDaie ID" value={record.kitadaie_id} />
              <DetailField label="MFA Email" value={record.mfa_email} />
              <DetailField
                label="Created At"
                value={formatDate(record.created_at)}
              />
            </Section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
