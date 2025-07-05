// // Script to add profile_completed field to existing users
// const { createClient } = require('@supabase/supabase-js')
// require('dotenv').config({ path: '.env.local' })

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// )

// async function migrateProfileCompleted() {
//   try {
//     console.log('Adding profile_completed field to users table...')
    
//     // Add the column if it doesn't exist
//     const { error: alterError } = await supabase.rpc('exec_sql', {
//       sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;'
//     })
    
//     if (alterError) {
//       console.error('Error adding column:', alterError)
//       return
//     }
    
//     console.log('Column added successfully!')
    
//     // Update existing users
//     console.log('Updating existing users...')
    
//     const { data: users, error: fetchError } = await supabase
//       .from('users')
//       .select('id, full_name, bio, interests')
    
//     if (fetchError) {
//       console.error('Error fetching users:', fetchError)
//       return
//     }
    
//     console.log(`Found ${users.length} users`)
    
//     for (const user of users) {
//       const hasBasicInfo = user.full_name && 
//                           user.full_name.trim() !== '' && 
//                           user.bio && 
//                           user.bio.trim() !== '' && 
//                           user.interests && 
//                           user.interests.length > 0
      
//       if (hasBasicInfo) {
//         const { error: updateError } = await supabase
//           .from('users')
//           .update({ profile_completed: true })
//           .eq('id', user.id)
        
//         if (updateError) {
//           console.error(`Error updating user ${user.id}:`, updateError)
//         } else {
//           console.log(`Updated user ${user.id} - profile completed`)
//         }
//       }
//     }
    
//     console.log('Migration completed!')
    
//   } catch (error) {
//     console.error('Migration failed:', error)
//   }
// }

// migrateProfileCompleted()// Script to add profile_completed field to existing users
// const { createClient } = require('@supabase/supabase-js')
// require('dotenv').config({ path: '.env.local' })

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// )

// async function migrateProfileCompleted() {
//   try {
//     console.log('Adding profile_completed field to users table...')
    
//     // Add the column if it doesn't exist
//     const { error: alterError } = await supabase.rpc('exec_sql', {
//       sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;'
//     })
    
//     if (alterError) {
//       console.error('Error adding column:', alterError)
//       return
//     }
    
//     console.log('Column added successfully!')
    
//     // Update existing users
//     console.log('Updating existing users...')
    
//     const { data: users, error: fetchError } = await supabase
//       .from('users')
//       .select('id, full_name, bio, interests')
    
//     if (fetchError) {
//       console.error('Error fetching users:', fetchError)
//       return
//     }
    
//     console.log(`Found ${users.length} users`)
    
//     for (const user of users) {
//       const hasBasicInfo = user.full_name && 
//                           user.full_name.trim() !== '' && 
//                           user.bio && 
//                           user.bio.trim() !== '' && 
//                           user.interests && 
//                           user.interests.length > 0
      
//       if (hasBasicInfo) {
//         const { error: updateError } = await supabase
//           .from('users')
//           .update({ profile_completed: true })
//           .eq('id', user.id)
        
//         if (updateError) {
//           console.error(`Error updating user ${user.id}:`, updateError)
//         } else {
//           console.log(`Updated user ${user.id} - profile completed`)
//         }
//       }
//     }
    
//     console.log('Migration completed!')
    
//   } catch (error) {
//     console.error('Migration failed:', error)
//   }
// }

// migrateProfileCompleted()