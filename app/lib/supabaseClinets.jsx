import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vbmppwydzlhegbpcjqfi.supabase.co'
const supabaseAnonKey = 'sb_publishable_fIL5OFBoAHA3O7um5Q-xLg_Se2g5NB1'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase

