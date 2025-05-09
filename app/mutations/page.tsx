import { Metadata } from "next"

export const metadata: Metadata = {
  title: "mutatio | saved mutations"
}

export default function MutationsPage() {
  return (
    <div className="flex items-center justify-center p-6 h-full">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Saved Mutations</h1>
        <p className="text-muted-foreground mb-6">
          Select a mutation from the sidebar to view or edit it, or create a new one.
        </p>
        <div className="p-12 rounded-xl bg-card border shadow-sm text-muted-foreground flex flex-col items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <p className="text-sm">Select a mutation to view details</p>
          <a href="/mutations/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 text-xs">
            Manually Create Mutation
          </a>
        </div>
      </div>
    </div>
  )
}