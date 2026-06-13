import { humanize } from "@/lib/utils";

interface Change {
  field: string;
  old_value: string;
  new_value: string;
}

export function DiffViewer({ changes }: { changes: Change[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-600">
            <th className="px-4 py-2 font-semibold">Field</th>
            <th className="px-4 py-2 font-semibold">Old value</th>
            <th className="px-4 py-2 font-semibold">New value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {changes.map((c) => (
            <tr key={c.field}>
              <td className="px-4 py-2 font-medium text-slate-700">
                {humanize(c.field)}
              </td>
              <td className="bg-red-50 px-4 py-2 text-red-800">
                <span className="line-through">{c.old_value}</span>
              </td>
              <td className="bg-green-50 px-4 py-2 text-green-800">
                {c.new_value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
