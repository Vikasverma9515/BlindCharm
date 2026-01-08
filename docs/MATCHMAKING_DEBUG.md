# Matchmaking Debug Guide

## Issues Identified

### 1. RLS Policy Issue (Primary Issue)
**Error:** `new row violates row-level security policy for table "matches"`

**Cause:** The Row Level Security (RLS) policy on the matches table is too restrictive and prevents the MatchingService from inserting matches.

**Solution:** Run the SQL script `fix_matchmaking_rls.sql` in your Supabase SQL editor.

### 2. Admin Button Not Showing
**Cause:** The `checkAdminStatus` function wasn't being called, so `isAdmin` remained false.

**Status:** ✅ Fixed - Added useEffect to call checkAdminStatus when session loads.

### 3. Automatic Matching Not Triggering
**Possible Causes:**
- Timer not running
- No participants in lobby
- RLS blocking the database insert

## Debug Steps

### Step 1: Check Admin Status
1. Open browser console
2. Look for these logs:
   - `🔍 Checking admin status for user: [user-id]`
   - `👑 Admin status updated: true/false`

### Step 2: Check Automatic Matching Timer
1. Wait for the top of any minute
2. Look for logs like:
   - `⏰ Current time: HH:MM:SS`
   - `🎯 Is match hour? true/false, Is minute 0? true/false`

### Step 3: Test Manual Matching
1. Click the admin "Test Match" or "Match Now" button
2. Look for these logs:
   - `🚀 Starting matchmaking process...`
   - `📊 Current participants: [number]`
   - `🎯 Triggering matching for lobby: [lobby-id]`
   - `📋 Matching result: [result object]`

### Step 4: Check Database Permissions
1. Run `fix_matchmaking_rls.sql` in Supabase SQL editor
2. This will fix the RLS policies to allow matchmaking

## Match Button Locations

The admin match button should appear in 3 places:

1. **Desktop Header** - Small "Test Match" button (if development mode OR admin email)
2. **Mobile Sidebar** - Full-width "Match Now" button (if admin)
3. **Desktop Sidebar** - Full-width "Match Now" button (if admin)

## Setting Admin Status

To make a user admin, run this SQL in Supabase:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your_admin_email@example.com';
```

## Scheduled Match Times

Automatic matching happens at:
- 11:00
- 12:00  
- 15:00
- 18:00
- 21:00
- 22:00

(All times in server timezone)

## Next Steps

1. **First Priority:** Run `fix_matchmaking_rls.sql` to fix database permissions
2. **Second:** Set your user as admin using the SQL above
3. **Third:** Test manual matching with the admin button
4. **Fourth:** Test automatic matching by waiting for a scheduled time