import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart"
import { type ChartConfig } from "../../../components/ui/chart"
import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"

type ChartData = {
  instansi: string
  jumlahKendaraan: number
  jumlahPenanggungJawab: number
}

const chartConfig = {
  jumlahKendaraan: {
    label: "Jumlah Kendaraan",
    color: "#2563eb",
  },
  jumlahPenanggungJawab: {
    label: "Jumlah Penanggung Jawab",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const ChartCountVehicleAsn = () => {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all institutions
        const { data: instansiData, error: instansiError } = await supabase
          .from('instansi')
          .select(`
            id,
            name,
            asn(id)
          `)

        if (instansiError) throw instansiError

        // Get vehicle counts through ASN relationships
        const formattedData: ChartData[] = []
        
        for (const inst of instansiData) {
          // Get vehicles count through ASN relationships
          const { count: vehicleCount, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact' })
            .in('asn_id', inst.asn?.map(a => a.id) || [])

          if (vehicleError) throw vehicleError

          formattedData.push({
            instansi: inst.name,
            jumlahKendaraan: vehicleCount || 0,
            jumlahPenanggungJawab: inst.asn?.length || 0
          })
        }

        setChartData(formattedData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError('Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <Card className="max-h-[600px]">
        <CardHeader>
          <CardTitle>
            Jumlah Kendaraan dan Jumlah Penanggung Jawab
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-red-500">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="max-h-[600px]">
        <CardHeader>
          <CardTitle>
            Jumlah Kendaraan dan Jumlah Penanggung Jawab
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          Loading...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-h-[600px]">
      <CardHeader>
        <CardTitle>
          Jumlah Kendaraan dan Jumlah Penanggung Jawab
        </CardTitle>
        <CardContent>
          <ChartContainer config={chartConfig} className="max-h-[300px] w-full mt-16">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="instansi"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="jumlahKendaraan" fill="var(--color-jumlahKendaraan)" radius={4} />
              <Bar dataKey="jumlahPenanggungJawab" fill="var(--color-jumlahPenanggungJawab)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </CardHeader>
    </Card>
  )
}

export {
  ChartCountVehicleAsn
}
