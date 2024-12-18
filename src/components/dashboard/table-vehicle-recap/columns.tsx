import { ColumnDef } from "@tanstack/react-table"

export type VehicleRecap = {
  instansi: string
  wheel_count: number
  total: number
  asn_count: number
}

export const columns: ColumnDef<VehicleRecap>[] = [
  {
    accessorKey: "instansi",
    header: "Instansi",
  },
  {
    accessorKey: "wheel_count",
    header: "Jenis Roda",
  },
  {
    accessorKey: "total",
    header: "Jumlah",
  },
  {
    accessorKey: "asn_count",
    header:"Jumlah ASN Penanggung Jawab"
  }
]