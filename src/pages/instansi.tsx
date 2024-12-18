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

const instansiSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
})

type InstansiForm = z.infer<typeof instansiSchema>

type Instansi = {
  id: string
  name: string
  description: string
  created_at: string
}

export default function InstansiPage() {
  const [instansis, setInstansis] = useState<Instansi[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInstansi, setEditingInstansi] = useState<Instansi | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstansiForm>({
    resolver: zodResolver(instansiSchema),
  })

  const fetchInstansis = async () => {
    try {
      const { data, error } = await supabase
        .from('instansi')
        .select('*')
        .order('name')

      if (error) throw error
      setInstansis(data)
    } catch (err) {
      console.error('Error fetching Instansis:', err)
      setError('Failed to fetch Instansis')
    }
  }

  useEffect(() => {
    fetchInstansis()
  }, [])

  useEffect(() => {
    if (editingInstansi) {
      reset({
        name: editingInstansi.name,
        description: editingInstansi.description,
      })
    } else {
      reset({
        name: '',
        description: '',
      })
    }
  }, [editingInstansi, reset])


  const onSubmit = async (data: InstansiForm) => {
    try {
      setIsLoading(true)
      setError(null)
  
      if (editingInstansi) {
        const { error } = await supabase
          .from('instansi')
          .update(data)
          .eq('id', editingInstansi.id)
  
        if (error) throw error
      } else {
        const { error } = await supabase.from('instansi').insert([data])
        if (error) throw error
      }
  
      await fetchInstansis()
      setIsDialogOpen(false)
      setEditingInstansi(null)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('instansi').delete().eq('id', id)
      if (error) throw error
      await fetchInstansis()
    } catch (err) {
      console.error('Error deleting Instansi:', err)
      setError('Failed to delete Instansi')
    }
  }

  const handleEdit = (instansi: Instansi) => {
    setEditingInstansi(instansi)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingInstansi(null)
      reset()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Instansi Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              Add Instansi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
            <DialogTitle>
              {editingInstansi ? 'Edit Instansi' : 'Add New Instansi'}
            </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register('description')} />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (editingInstansi ? 'Saving...' : 'Adding...') 
                  : (editingInstansi ? 'Save Changes' : 'Add Instansi')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instansis.map((instansi) => (
            <TableRow key={instansi.id}>
              <TableCell>{instansi.name}</TableCell>
              <TableCell>{instansi.description}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(instansi)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(instansi.id)}
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
