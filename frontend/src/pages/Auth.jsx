import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { siGoogle } from "simple-icons";

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md p-8 rounded-2xl border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-xl bg-primary/10 p-4 ring-1 ring-primary/20">
            <Bot className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">Welcome to InstaLoan AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your conversation
          </p>
        </div>

        {/* Google */}
        <div className="mt-8">
          <Button variant="outline" className="w-full h-11 gap-3">
            <span
              className="h-4 w-5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:fill-muted-foreground"
              dangerouslySetInnerHTML={{ __html: siGoogle.svg }}
            />
            Continue with Google
          </Button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email auth */}
        <div className="space-y-3">
          <Button className="w-full h-11">Login with Email</Button>
          <Button variant="ghost" className="w-full h-11 text-muted-foreground">
            Create an account
          </Button>
        </div>
      </Card>
    </div>
  );
}
