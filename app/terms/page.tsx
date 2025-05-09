import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "mutatio | terms of service",
}

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: May 7, 2024</p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-ul:my-4 prose-strong:text-foreground">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Mutatio ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Mutatio is an AI prompt engineering platform that allows users to create, test, and optimize prompts for various AI models. We provide tools for mutation, validation, and analysis of prompts.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate information. You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
        </p>

        <h2>4. API Keys and Third-Party Services</h2>
        <p>
          Our Service may require you to provide API keys for third-party services like OpenAI, Anthropic, or Mistral. You are responsible for:
        </p>
        <ul>
          <li>Obtaining these API keys legally and in compliance with their respective terms</li>
          <li>Managing the costs associated with the usage of these services</li>
          <li>Ensuring the security of your API keys</li>
        </ul>
        <p>
          Mutatio stores your API keys only in your browser's local storage and does not transmit them to our servers except as needed to facilitate API calls to the respective services.
        </p>

        <h2>5. Content and Conduct</h2>
        <p>
          You may not use the Service for any illegal or unauthorized purpose. You agree not to use the Service to create, upload, or share content that:
        </p>
        <ul>
          <li>Is illegal, harmful, threatening, abusive, harassing, or defamatory</li>
          <li>Infringes on the intellectual property rights of others</li>
          <li>Contains malicious code, viruses, or harmful data</li>
          <li>Attempts to circumvent any safety mechanisms or ethical guidelines of AI services</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by Mutatio and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </p>
        <p>
          Content you create using the Service belongs to you. However, by using our Service, you grant us a non-exclusive, royalty-free license to use, reproduce, adapt, and publish your content solely for the purpose of displaying, distributing, and promoting the Service.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          In no event shall Mutatio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul>
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          <li>The cost of usage or overage charges from third-party API services</li>
        </ul>

        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of the jurisdiction in which Mutatio is established, without regard to its conflict of law provisions.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us.
        </p>
      </div>
    </div>
  )
}