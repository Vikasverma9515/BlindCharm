// // src/lib/tasks/matchingTask.ts
// import { supabase } from '@/lib/supabase'
// import { MatchingService } from '@/lib/services/MatchingService'

// export async function runMatchingCycle() {
//   try {
//     // Get all active lobbies
//     const { data: lobbies, error } = await supabase
//       .from('lobbies')
//       .select('id')
//       .eq('status', 'waiting');

//     if (error) throw error;

//     // Perform matching for each lobby
//     for (const lobby of lobbies) {
//       await MatchingService.performMatching(lobby.id);
//     }
//   } catch (error) {
//     console.error('Error in matching cycle:', error);
//   }
// }