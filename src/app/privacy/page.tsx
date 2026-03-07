import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Promptok. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 7, 2026
        </p>

        <div className="prose prose-sm mt-8 max-w-none text-muted-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6">
          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul>
            <li>
              <strong>Account information:</strong> name, email address, and
              profile picture (when signing in with Google).
            </li>
            <li>
              <strong>Content you provide:</strong> prompts, narration text, and
              video preferences you submit to generate videos.
            </li>
            <li>
              <strong>Payment information:</strong> processed securely by Stripe.
              We do not store credit card numbers or bank account details.
            </li>
            <li>
              <strong>Usage data:</strong> pages visited, features used, video
              generation counts, and general interaction patterns.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device
              information, and cookies for session management.
            </li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide and operate the Service.</li>
            <li>To process payments and manage subscriptions.</li>
            <li>
              To generate AI videos based on your prompts and preferences.
            </li>
            <li>To send transactional emails (account, billing, support).</li>
            <li>
              To improve the Service through aggregated, anonymized analytics.
            </li>
            <li>To detect and prevent fraud or abuse.</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>We do not sell your personal information. We share data only:</p>
          <ul>
            <li>
              <strong>With service providers:</strong> Supabase (authentication
              and database), Stripe (payments), and AI providers (to process your
              prompts and generate content).
            </li>
            <li>
              <strong>When required by law:</strong> to comply with legal
              obligations, enforce our Terms, or protect rights and safety.
            </li>
          </ul>

          <h2>4. AI Processing</h2>
          <p>
            Your prompts and narration text are sent to third-party AI providers
            to generate video content. These providers process your data
            according to their own privacy policies. We do not use your content
            to train AI models. Generated videos are stored securely and
            accessible only to your account.
          </p>

          <h2>5. Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption.
            Account data is hosted on Supabase with row-level security. Media
            files (generated videos and images) are stored in secure cloud
            storage. We implement appropriate technical and organizational
            measures to protect your data.
          </p>

          <h2>6. Data Retention</h2>
          <ul>
            <li>
              Account data is retained while your account is active and for a
              reasonable period after deletion.
            </li>
            <li>
              Generated videos are retained while your account is active. They
              may be deleted after account cancellation.
            </li>
            <li>
              Payment records are retained as required by financial regulations.
            </li>
          </ul>

          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal data.</li>
            <li>Export your data in a portable format.</li>
            <li>Withdraw consent for optional data processing.</li>
            <li>Object to automated decision-making.</li>
            <li>Lodge a complaint with a supervisory authority.</li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:hello@promptok.ai"
              className="text-foreground underline"
            >
              hello@promptok.ai
            </a>
            .
          </p>

          <h2>8. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management.
            We use a locale preference cookie (NEXT_LOCALE) to remember your
            language selection. We do not use tracking or advertising cookies.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed to children under 13. We do not
            knowingly collect personal information from children. If we discover
            that a child has provided personal information, we will delete it
            promptly.
          </p>

          <h2>10. International Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries other
            than your own. We ensure appropriate safeguards are in place for
            international data transfers.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes via email or through the Service. The
            &quot;Last updated&quot; date reflects when the policy was last
            revised.
          </p>

          <h2>12. Contact</h2>
          <p>
            For privacy-related questions or requests, contact us at{" "}
            <a
              href="mailto:hello@promptok.ai"
              className="text-foreground underline"
            >
              hello@promptok.ai
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
