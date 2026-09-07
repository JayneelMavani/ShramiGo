import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Car, Hammer, MoreHorizontal, Paintbrush, Smartphone, Snowflake, Sofa, Sparkles, Wrench, Zap, IndianRupee, Loader2 } from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { addWorkerService, getMyWorkerServices, getServices, createWorkerSkill, getWorkerSkills, updateWorkerService } from "../../services/worker";

const skills = [
  { id: "electrician", name: "Electrician", category: "Electrical", icon: Zap },
  { id: "plumber", name: "Plumber", category: "Plumbing", icon: Wrench },
  { id: "carpenter", name: "Carpenter", category: "Carpentry", icon: Hammer },
  { id: "painter", name: "Painter", category: "Painting", icon: Paintbrush },
  { id: "cleaner", name: "Cleaner", category: "Cleaning", icon: Sparkles },
  { id: "driver", name: "Driver", category: "Driving", icon: Car },
  { id: "ac-repair", name: "AC Repair", category: "Appliance Repair", icon: Snowflake },
  { id: "appliance-repair", name: "Appliance Repair", category: "Appliance Repair", icon: Smartphone },
  { id: "sofa-cleaning", name: "Sofa Cleaning", category: "Cleaning", icon: Sofa },
  { id: "other", name: "Other", category: "Other", icon: MoreHorizontal },
];

const skillToService: Record<string, string[]> = {
  Electrician: ["Electrical Repair"], Plumber: ["Plumbing Repair"], Carpenter: ["Carpentry"], Painter: ["Painting"],
  Cleaner: ["Home Cleaning", "Deep Cleaning"], Driver: ["Driver Service"], "AC Repair": ["AC Repair"],
  "Appliance Repair": ["Appliance Repair"], "Sofa Cleaning": ["Sofa Cleaning"],
};

export default function Skills() {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<number, string>>({});
  const [serviceNames, setServiceNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [savedSkills, savedServices] = await Promise.all([getWorkerSkills(), getMyWorkerServices()]);
        const skillNames = savedSkills.map((s) => s.skill_name);
        const names = Object.fromEntries(savedServices.map((s) => [s.service_id, s.name]));
        const prices = Object.fromEntries(savedServices.map((s) => [s.service_id, s.custom_price != null ? String(s.custom_price) : ""]));
        setServiceNames(names);
        setServicePrices(prices);
        setSelectedSkills(skills.filter((skill) => skillNames.includes(skill.name) || (skillToService[skill.name] || []).some((n) => savedServices.some((s) => s.name === n))).map((s) => s.name));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load your services.");
      } finally { setLoading(false); }
    })();
  }, []);

  const toggleSkill = (name: string) => setSelectedSkills((current) => current.includes(name) ? current.filter((s) => s !== name) : [...current, name]);

  const mappedServices = Array.from(new Set(selectedSkills.flatMap((skill) => skillToService[skill] || [])))
    .map((name) => Object.entries(serviceNames).find(([, n]) => n === name)?.[0])
    .filter(Boolean) as string[];

  const handlePrice = (serviceId: string, value: string) => {
    if (value === "" || /^\d*(\.\d{0,2})?$/.test(value)) setServicePrices((p) => ({ ...p, [Number(serviceId)]: value }));
  };

  const handleContinue = async () => {
    if (!selectedSkills.length) return;
    setSaving(true); setError("");
    try {
      const existingSkills = await getWorkerSkills();
      for (const name of selectedSkills) if (!existingSkills.some((s) => s.skill_name === name)) {
        const skill = skills.find((s) => s.name === name);
        await createWorkerSkill({ skill_name: name, category: skill?.category });
      }
      const catalogue = await getServices();
      const existing = await getMyWorkerServices();
      const existingByService = new Map(existing.map((s) => [s.service_id, s]));
      const wantedNames = new Set(mappedServices.map((id) => serviceNames[Number(id)]));
      for (const name of wantedNames) {
        const service = catalogue.find((s) => s.name === name);
        if (!service) continue;
        const raw = servicePrices[service.id] ?? "";
        const price = raw === "" ? undefined : Number(raw);
        if (price !== undefined && (!Number.isFinite(price) || price <= 0)) throw new Error(`Enter a valid charge for ${service.name}.`);
        const existingService = existingByService.get(service.id);
        if (existingService) {
          await updateWorkerService(existingService.id, { custom_price: price ?? null, is_active: true });
        } else {
          await addWorkerService(service.id, price);
        }
      }
      navigate("/worker/availability");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save your services."); }
    finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4"><div className="w-full max-w-md min-h-screen sm:min-h-[760px] bg-white sm:rounded-[32px] shadow-xl overflow-hidden flex flex-col">
    <div className="bg-[#087F7A] px-6 pt-8 pb-8 rounded-b-[34px]"><button type="button" onClick={() => navigate("/worker")} disabled={saving} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><ArrowLeft size={20}/></button><div className="mt-6 flex items-center gap-3"><BrandLogo size="sm"/><div><p className="text-white/60 text-xs">Worker Profile</p><h1 className="text-xl font-bold text-white">Your skills & charges</h1></div></div><p className="text-white/75 text-sm mt-4 leading-5">Choose what you offer and set your own hourly service charge.</p></div>
    <div className="px-6 pt-6"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-[#087F7A]">Step 1 of 2</span><span className="text-xs text-gray-400">Choose services & set charges</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full w-1/2 bg-[#087F7A] rounded-full"/></div></div>
    <div className="flex-1 px-6 pt-6 overflow-y-auto"><h2 className="text-lg font-bold text-gray-900">What can you do?</h2><p className="text-xs text-gray-500 mt-1">Your charge is what customers will pay for your service per hour.</p>
      {loading ? <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-[#087F7A]"/></div> : <><div className="grid grid-cols-2 gap-3 mt-5 pb-5">{skills.map((skill) => { const Icon=skill.icon; const selected=selectedSkills.includes(skill.name); return <button key={skill.id} type="button" onClick={()=>toggleSkill(skill.name)} disabled={saving} className={`p-4 rounded-2xl border-2 text-left transition-all ${selected ? "border-[#087F7A] bg-teal-50" : "border-gray-100 bg-white"}`}><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-[#087F7A] text-white" : "bg-gray-100 text-gray-500"}`}><Icon size={20}/></div><p className="text-sm font-semibold text-gray-900 mt-3">{skill.name}</p><p className="text-[11px] text-gray-400 mt-1">{skill.category}</p></button>})}</div>
      {mappedServices.length > 0 && <div className="pb-5"><div className="mb-3"><h2 className="text-base font-bold text-gray-900">Set your service charges</h2><p className="text-xs text-gray-500 mt-1">You control your own price. Leave blank to use the platform base price.</p></div>{mappedServices.map((id)=>{const sid=Number(id); const name=serviceNames[sid]; return <div key={sid} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-3"><div className="flex items-center justify-between mb-3"><div><p className="text-sm font-semibold text-gray-900">{name}</p><p className="text-[11px] text-gray-400">Your charge per hour</p></div><span className="text-[11px] font-semibold text-[#087F7A]">Worker controlled</span></div><div className="relative"><IndianRupee size={16} className="absolute left-3 top-3.5 text-gray-400"/><input inputMode="decimal" value={servicePrices[sid] ?? ""} onChange={(e)=>handlePrice(id,e.target.value)} placeholder="Enter your charge" className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#087F7A]"/></div></div>})}</div>}</>}
      {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-4"><p className="text-sm text-red-600">{error}</p></div>}
    </div>
    <div className="px-6 pb-7 pt-5 bg-white border-t border-gray-100"><button type="button" onClick={handleContinue} disabled={loading||saving||!selectedSkills.length} className={`w-full h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 ${selectedSkills.length&&!loading&&!saving ? "bg-[#FF5A00] text-white shadow-lg shadow-orange-200" : "bg-gray-100 text-gray-400"}`}>{saving ? <><Loader2 size={18} className="animate-spin"/>Saving...</> : <>Continue<ArrowRight size={19}/></>}</button>{!selectedSkills.length&&!loading&&<p className="text-center text-[11px] text-gray-400 mt-3">Select at least one skill to continue</p>}</div>
  </div></div>;
}
