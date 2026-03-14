export interface StepInstructionProps {
    num: number;
    text: string;
}

export const StepInstruction = ({ num, text }: StepInstructionProps) => (
    <div className="flex items-start gap-3">
        <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">
            {num}
        </div>
        <p className="text-slate-600 text-sm font-medium">{text}</p>
    </div>
);
