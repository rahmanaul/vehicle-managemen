import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { VehicleRecap, columns } from '@/components/dashboard/table-vehicle-recap/columns'
import {VehicleInstansi, columns as columnsVehicleInstansi} from '@/components/dashboard/table-vehicle-instansi/columns'
import { DataTable } from '@/components/data-table'
import { ChartCountVehicleAsn } from '@/components/dashboard/chart/chart-count-vehcle-asn'


type Stats = {
  totalVehicles: number
  totalASN: number
  totalInstansi: number
  unassignedVehicles: number
  tableVehicleRecap: VehicleRecap[],
  tebleVehicleInstansi: VehicleInstansi[],
}


interface InstansiData {
  id: string;
  name: string;
}

interface AsnData {
  instansi: InstansiData;
}

interface VehicleData {
  wheel_count: number;
  type: 'Sedan' | 'SUV' | 'Sepeda Motor';
  asn: AsnData;
}

interface ItemResponseVehicleInstansiTable{
  asn : {
    name: string;
  },
  brand: string;
  nopol: string;
  type: string;
  wheel_count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    totalASN: 0,
    totalInstansi: 0,
    unassignedVehicles: 0,
    tableVehicleRecap:[],
    tebleVehicleInstansi: [],

  })

  const fetchStats = async () => {
    try {
      // Get total vehicles
      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact' })

      // Get unassigned vehicles
      const { count: unassignedVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact' })
        .is('asn_id', null)

      // Get total ASN
      const { count: totalASN } = await supabase
        .from('asn')
        .select('*', { count: 'exact' })

      // Get total Instansi
      const { count: totalInstansi } = await supabase
        .from('instansi')
        .select('*', { count: 'exact' })

      // get Table Vehicle Recap
      const { data: tableVehicleRecap} = await supabase
        .from('vehicles')
        .select(`
          wheel_count,
          asn:asn_id(
            instansi:instansi_id(
              id,
              name
            )
          )
        `) as { data: VehicleData[]; error: unknown };
    // Transform data into VehicleRecap format
    const recapMap = new Map<string, VehicleRecap>()

    tableVehicleRecap.forEach((vehicle) => {
      const instansiName = vehicle.asn?.instansi?.name || 'Unassigned'
      const key = `${instansiName}-${vehicle.wheel_count}`
      
      if (!recapMap.has(key)) {
        recapMap.set(key, {
          instansi: instansiName,
          wheel_count: vehicle.wheel_count,
          total: 0,
          asn_count: 0
        })
      }
      
      const recap = recapMap.get(key)!
      recap.total += 1
      if (vehicle.asn?.instansi) {
        recap.asn_count += 1
      }
    })
    //  get Table VehicleInstansi
    const {data: dataTableVehicleInstansi} = await supabase
    .from('vehicles')
    .select(`
      nopol,
      wheel_count,
      brand,
      type,
      asn:asn_id (
        name
      )
    `) as {
      data: ItemResponseVehicleInstansiTable[]
    }
    const formattedData: VehicleInstansi[] = (dataTableVehicleInstansi || []).map((vehicle) => ({
      nopol: vehicle.nopol,
      wheel_count: vehicle.wheel_count,
      brand: vehicle.brand,
      type: vehicle.type,
      asn_name: vehicle.asn?.name || 'Unassigned'
    }))

    setStats({
      totalVehicles: totalVehicles || 0,
      unassignedVehicles: unassignedVehicles || 0,
      totalASN: totalASN || 0,
      totalInstansi: totalInstansi || 0,
      tableVehicleRecap: Array.from(recapMap.values()),
      tebleVehicleInstansi: formattedData
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unassignedVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ASN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalASN}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instansi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstansi}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Data Rekap Kendaraan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={stats.tableVehicleRecap} />
        </CardContent>
      </Card>

      <Card className=''>
        <CardHeader>
            <CardTitle>Data Kendaraan Pada Instansi</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columnsVehicleInstansi} data={stats.tebleVehicleInstansi} />
        </CardContent>
      </Card>
      <ChartCountVehicleAsn />
    </div>
  )
}
