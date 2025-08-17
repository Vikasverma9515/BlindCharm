import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [userGender, setUserGender] = useState<string | null>(null);

  useEffect(() => {
    const fetchGender = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("gender")
          .eq("id", user.id) // assumes your users table has same id as auth
          .single();

        if (!error && data) {
          setUserGender(data.gender?.toLowerCase());
        }
      }
    };

    fetchGender();
  }, []);

  const isGirl = userGender === "female";
  const isBoy = userGender === "male";

  return (
    <div>
      {isGirl && <button>Create Question</button>}
      {isBoy && <p>Hey bro 👋</p>}
    </div>
  );
}
