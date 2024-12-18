import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const vehicleSchema = z.object({
  nopol: z.string().min(1, 'Nopol is required'),
  wheel_count: z.coerce.number().min(2).max(4),
  brand: z.string().min(1, 'Brand is required'),
  type: z.enum(['Sedan', 'SUV', 'Sepeda Motor']),
  year: z.coerce.number().min(1900).max(new Date().getFullYear()),
  asn_id: z.string().optional(),
})

type VehicleForm = z.infer<typeof vehicleSchema>

type Vehicle = {
  id: string
  nopol: string
  wheel_count: number
  brand: string
  type: string
  year: number
  asn_id: string | null
  created_at: string
  asn?: {
    name: string
  }
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [asns, setAsns] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
  })

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, asn:asn_id(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data)
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError('Failed to fetch vehicles')
    }
  }

  const fetchASNs = async () => {
    try {
      const { data, error } = await supabase
        .from('asn')
        .select('id, name')
        .order('name')

      if (error) throw error
      setAsns(data)
    } catch (err) {
      console.error('Error fetching ASNs:', err)
      setError('Failed to fetch ASNs')
    }
  }


  useEffect(() => {
    if (editingVehicle) {
      reset({
        nopol: editingVehicle.nopol,
        wheel_count: editingVehicle.wheel_count,
        brand: editingVehicle.brand,
        type: editingVehicle.type as 'Sedan' | 'SUV' | 'Sepeda Motor',
        year: editingVehicle.year,
        asn_id: editingVehicle.asn_id || undefined,
      })
    } else {
      reset({
        nopol: '',
        wheel_count: 2,
        brand: '',
        type: 'Sedan',
        year: new Date().getFullYear(),
        asn_id: undefined,
      })
    }
  }, [editingVehicle, reset])

  useEffect(() => {
    fetchVehicles()
    fetchASNs()
  }, [])

  const onSubmit = async (data: VehicleForm) => {
    try {
      setIsLoading(true)
      setError(null)
  
      if (data.asn_id) {
        const { data: existingVehicle, error: checkError } = await supabase
          .from('vehicles')
          .select('id')
          .eq('asn_id', data.asn_id)
          .single()
  
        if (checkError && checkError.code !== 'PGRST116') throw checkError
        if (existingVehicle && (!editingVehicle || existingVehicle.id !== editingVehicle.id)) {
          throw new Error('This ASN already has a vehicle assigned')
        }
      }
  
      if (editingVehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update({ ...data, asn_id: data.asn_id || null })
          .eq('id', editingVehicle.id)
  
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert([{ ...data, asn_id: data.asn_id || null }])
  
        if (error) throw error
      }
  
      await fetchVehicles()
      setIsDialogOpen(false)
      setEditingVehicle(null)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id)
      if (error) throw error
      await fetchVehicles()
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      setError('Failed to delete vehicle')
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingVehicle(null)
      reset()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>Add Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nopol">Nopol</Label>
                <Input id="nopol" {...register('nopol')} />
                {errors.nopol && (
                  <p className="text-sm text-red-500">{errors.nopol.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wheel_count">Wheel Count</Label>
                <select
                  id="wheel_count"
                  {...register('wheel_count')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                {errors.wheel_count && (
                  <p className="text-sm text-red-500">
                    {errors.wheel_count.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" {...register('brand')} />
                {errors.brand && (
                  <p className="text-sm text-red-500">{errors.brand.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Sepeda Motor">Sepeda Motor</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  {...register('year')}
                  min={1900}
                  max={new Date().getFullYear()}
                />
                {errors.year && (
                  <p className="text-sm text-red-500">{errors.year.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="asn_id">Assigned ASN</Label>
                <select
                  id="asn_id"
                  {...register('asn_id')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Not Assigned</option>
                  {asns.map((asn) => (
                    <option key={asn.id} value={asn.id}>
                      {asn.name}
                    </option>
                  ))}
                </select>
                {errors.asn_id && (
                  <p className="text-sm text-red-500">{errors.asn_id.message}</p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (editingVehicle ? 'Saving...' : 'Adding...') 
                  : (editingVehicle ? 'Save Changes' : 'Add Vehicle')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nopol</TableHead>
            <TableHead>Wheel Count</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.nopol}</TableCell>
              <TableCell>{vehicle.wheel_count}</TableCell>
              <TableCell>{vehicle.brand}</TableCell>
              <TableCell>{vehicle.type}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>{vehicle.asn?.name || 'Not Assigned'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(vehicle)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
