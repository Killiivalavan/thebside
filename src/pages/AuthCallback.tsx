import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      // Supabase auto-detects session in URL by default; ensure session loaded then redirect
      await supabase.auth.getSession();
      navigate("/discover", { replace: true });
    };
    run();
  }, [navigate]);

  return null;
};

export default AuthCallback;


