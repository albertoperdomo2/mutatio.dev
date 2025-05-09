import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "mutatio | privacy policy",
}

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 bg-background/95 min-h-screen">
      <div className="mb-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </Link>
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 7, 2024</p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-ul:my-4 prose-strong:text-foreground">
        <h2>1. Introduction</h2>
        <p>
          Welcome to Mutatio ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
          This privacy policy will inform you about how we look after your personal data when you visit our website and use our services.
        </p>

        <h2>2. Data We Collect</h2>
        <p>We collect and process the following types of information:</p>
        <ul>
          <li><strong>Account Information:</strong> Email address and password for account creation.</li>
          <li><strong>Usage Data:</strong> Information about how you use our service, including prompts and mutations you create.</li>
          <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform.</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>We use your personal data for the following purposes:</p>
        <ul>
          <li>To provide and maintain our service</li>
          <li>To notify you about changes to our service</li>
          <li>To provide customer support</li>
          <li>To improve our service</li>
          <li>To prevent fraud or illegal activities</li>
        </ul>

        <h2>4. API Keys and Credentials</h2>
        <p>
          Mutatio does not store your API keys for third-party services (like OpenAI, Anthropic, or Mistral) on our servers. 
          These are securely stored in your browser's local storage, encrypted, and never transmitted to our servers.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, 
          or accessed in an unauthorized way. We limit access to your personal data to employees, agents, contractors, and 
          other third parties who have a business need to know.
        </p>

        <h2>6. Your Data Protection Rights</h2>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
        <ul>
          <li>Request access to your personal data</li>
          <li>Request correction of your personal data</li>
          <li>Request erasure of your personal data</li>
          <li>Object to processing of your personal data</li>
          <li>Request restriction of processing your personal data</li>
          <li>Request transfer of your personal data</li>
          <li>Right to withdraw consent</li>
        </ul>

        <h2>7. Third-Party Services</h2>
        <p>
          When you use Mutatio with third-party AI services (OpenAI, Anthropic, etc.), your interactions with those services 
          are governed by their respective privacy policies. We recommend reviewing the privacy policies of these services.
        </p>

        <h2>8. Cookies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
          Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct 
          your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>

        <h2>9. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
          on this page and updating the "last updated" date.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </div>
  )
}