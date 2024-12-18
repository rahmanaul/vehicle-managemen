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

const asnSchema = z.object({
  nip: z.string().min(1, 'NIP is required'),
  name: z.string().min(1, 'Name is required'),
  position: z.string().min(1, 'Position is required'),
  instansi_id: z.string().min(1, 'Instansi is required'),
})

type ASNForm = z.infer<typeof asnSchema>

type ASN = {
  id: string
  nip: string
  name: string
  position: string
  instansi_id: string
  created_at: string
  instansi: {
    name: string
  }
}

export default function ASNPage() {
  const [asns, setAsns] = useState<ASN[]>([])
  const [instansis, setInstansis] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAsn, setEditingAsn] = useState<ASN | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ASNForm>({
    resolver: zodResolver(asnSchema),
  })

  const fetchASNs = async () => {
    try {
      const { data, error } = await supabase
        .from('asn')
        .select('*, instansi:instansi_id(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAsns(data)
    } catch (err) {
      console.error('Error fetching ASNs:', err)
      setError('Failed to fetch ASNs')
    }
  }

  const fetchInstansis = async () => {
    try {
      const { data, error } = await supabase
        .from('instansi')
        .select('id, name')
        .order('name')

      if (error) throw error
      setInstansis(data)
    } catch (err) {
      console.error('Error fetching Instansis:', err)
      setError('Failed to fetch Instansis')
    }
  }

  useEffect(() => {
    fetchASNs()
    fetchInstansis()
  }, [])

  useEffect(() => {
    if (editingAsn) {
      reset({
        nip: editingAsn.nip,
        name: editingAsn.name,
        position: editingAsn.position,
        instansi_id: editingAsn.instansi_id,
      })
    } else {
      reset({
        nip: '',
        name: '',
        position: '',
        instansi_id: '',
      })
    }
  }, [editingAsn, reset])

  const onSubmit = async (data: ASNForm) => {
    try {
      setIsLoading(true)
      setError(null)
  
      if (editingAsn) {
        const { error } = await supabase
          .from('asn')
          .update(data)
          .eq('id', editingAsn.id)
  
        if (error) throw error
      } else {
        const { error } = await supabase.from('asn').insert([data])
        if (error) throw error
      }
  
      await fetchASNs()
      setIsDialogOpen(false)
      setEditingAsn(null)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

    // Add handleEdit function
  const handleEdit = (asn: ASN) => {
    setEditingAsn(asn)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('asn').delete().eq('id', id)
      if (error) throw error
      await fetchASNs()
    } catch (err) {
      console.error('Error deleting ASN:', err)
      setError('Failed to delete ASN')
    }
  }

  // Add a close handler for the dialog
const handleDialogClose = (open: boolean) => {
  setIsDialogOpen(open)
  if (!open) {
    setEditingAsn(null)
    reset()
  }
}

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ASN Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>Add ASN</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAsn ? 'Edit ASN' : 'Add New ASN'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" {...register('nip')} />
                {errors.nip && (
                  <p className="text-sm text-red-500">{errors.nip.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" {...register('position')} />
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instansi_id">Instansi</Label>
                <select
                  id="instansi_id"
                  {...register('instansi_id')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select Instansi</option>
                  {instansis.map((instansi) => (
                    <option key={instansi.id} value={instansi.id}>
                      {instansi.name}
                    </option>
                  ))}
                </select>
                {errors.instansi_id && (
                  <p className="text-sm text-red-500">
                    {errors.instansi_id.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (editingAsn ? 'Saving...' : 'Adding...') 
                  : (editingAsn ? 'Save Changes' : 'Add ASN')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIP</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Instansi</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asns.map((asn) => (
            <TableRow key={asn.id}>
              <TableCell>{asn.nip}</TableCell>
              <TableCell>{asn.name}</TableCell>
              <TableCell>{asn.position}</TableCell>
              <TableCell>{asn.instansi?.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(asn)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(asn.id)}
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
