import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestData() {
  try {
    // Create test instansi (departments)
    const { data: instansi1 } = await supabase
      .from('instansi')
      .insert({
        name: 'Dinas Lingkungan Hidup',
        description: 'Dinas yang menangani masalah lingkungan hidup di Jakarta'
      })
      .select()
      .single()

    const { data: instansi2 } = await supabase
      .from('instansi')
      .insert({
        name: 'Dinas Pendidikan',
        description: 'Dinas yang menangani masalah pendidikan di Jakarta'
      })
      .select()
      .single()

    console.log('Created instansi:', { instansi1, instansi2 })

    // Create test ASN (employees)
    const { data: asn1 } = await supabase
      .from('asn')
      .insert({
        nip: '198501012010011001',
        name: 'Budi Santoso',
        position: 'Kepala Seksi',
        instansi_id: instansi1.id
      })
      .select()
      .single()

    const { data: asn2 } = await supabase
      .from('asn')
      .insert({
        nip: '198601022010011002',
        name: 'Dewi Lestari',
        position: 'Staff',
        instansi_id: instansi2.id
      })
      .select()
      .single()

    console.log('Created ASN:', { asn1, asn2 })

    // Create test vehicles
    const { data: vehicle1 } = await supabase
      .from('vehicles')
      .insert({
        nopol: 'B 1234 ABC',
        wheel_count: 4,
        brand: 'Toyota',
        type: 'Sedan',
        year: 2020,
        asn_id: asn1.id
      })
      .select()
      .single()

    const { data: vehicle2 } = await supabase
      .from('vehicles')
      .insert({
        nopol: 'B 5678 DEF',
        wheel_count: 2,
        brand: 'Honda',
        type: 'Sepeda Motor',
        year: 2021,
        asn_id: asn2.id
      })
      .select()
      .single()

    console.log('Created vehicles:', { vehicle1, vehicle2 })

    console.log('Test data created successfully!')
  } catch (error) {
    console.error('Error creating test data:', error)
  }
}

createTestData()
