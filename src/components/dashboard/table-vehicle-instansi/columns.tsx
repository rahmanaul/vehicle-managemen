import { ColumnDef } from "@tanstack/react-table"

export type VehicleInstansi = {
  nopol: string
  wheel_count: number
  brand: string
  type: string
  asn_name: string
}

export const columns: ColumnDef<VehicleInstansi>[] = [
  {
    accessorKey: "nopol",
    header: "Nopol",
  },
  {
    accessorKey: "wheel_count",
    header: "Jenis Roda",
  },
  {
    accessorKey: "brand",
    header: "Merek",
  },
  {
    accessorKey: "type",
    header:"Tipe"
  },
  {
    accessorKey: "asn_name",
    header: "Penanggung Jawab"
  }
]