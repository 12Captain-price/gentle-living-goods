import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin2025") {
      sessionStorage.setItem("sc_admin", "1");
      navigate("/admin");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linen p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-background p-10 border border-border">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl">Stationery City</h1>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">Admin</p>
        </div>
        <label className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground block mb-2">Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none h-12" autoFocus />
        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        <Button type="submit" className="w-full mt-6 rounded-none py-6 text-sm tracking-[0.15em] uppercase bg-navy hover:bg-navy/90">
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;