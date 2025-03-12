import { Sub } from "@/app/types";

export default function Dialogue({ subs }: { subs: Sub[] }) {
    return (
        <>
            {subs.map((sub) => {
                const { id, from, to, content, tokens } = sub;
                return (
                    <div key={id} className="flex flex-col gap-2 mb-4 p-3 border rounded-lg">
                        <div className="flex flex-row justify-between">
                            <p className="text-lg">{content}</p>
                            <div className="flex flex-col text-sm text-gray-500">
                                <p>{from}</p>
                                <p>{to}</p>
                            </div>
                        </div>
                        
                        {tokens && tokens.length > 0 && (
                            <div className="mt-2 text-sm">
                                <p className="font-bold mb-1">Tokenized:</p>
                                <div className="flex flex-wrap gap-2">
                                    {tokens.map((token, index) => (
                                        <div key={index} className="bg-gray-100 text-black p-1 rounded">
                                            <span title={`${token.pos}: ${token.basic_form}`}>
                                                {token.surface_form}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )
}