import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useViewer } from "@/contexts/viewer-context";
import { cn } from "@/lib/utils";

export const SystemLog = memo(function SystemLog() {
  const { logs, clearLogs } = useViewer();

  return (
    <div className="mt-8 border p-4 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">System Log</h2>
        <Button variant="outline" size="sm" onClick={clearLogs}>
          Clear Log
        </Button>
      </div>
      <div className="h-[200px] overflow-y-auto space-y-2 font-mono text-sm bg-muted/50 p-4 rounded-lg">
        {logs.length === 0 ? (
          <p className="text-muted-foreground italic">No actions logged yet.</p>
        ) : (
          logs.map(({ time, message, type }, index) => (
            <div key={index} className="flex gap-3">
              <span className="text-muted-foreground whitespace-nowrap">
                {time}
              </span>
              <span
                className={cn("whitespace-pre-wrap", {
                  "text-red-500": type === "error",
                })}
              >
                {message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
