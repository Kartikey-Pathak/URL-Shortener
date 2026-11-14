import { CometCard } from "@/components/ui/comet-card";

export default function CometCardDemo() {
  return (
    <CometCard>
      <div className="flex w-80 flex-col rounded-2xl bg-[#1F2121] p-4 text-white">
        <div className="font-bold text-lg">Comet Card Demo</div>
        <p className="text-xs text-gray-400 mt-2">Interactive 3D depth and glare card</p>
      </div>
    </CometCard>
  );
}
