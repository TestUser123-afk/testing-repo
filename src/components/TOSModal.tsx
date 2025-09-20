'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Flame } from 'lucide-react';

interface TOSModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function TOSModal({ isOpen, onAccept }: TOSModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Flame className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="fire-text text-2xl">Welcome to Ember</CardTitle>
          </div>
          <CardDescription>
            Please review and accept our Terms of Service to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-2">Terms of Service</h3>
              <p className="text-muted-foreground mb-4">Effective date: Sept 17, 2025</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Agreement to Terms</h4>
              <p className="text-muted-foreground">
                Welcome to Ember. By accessing or using our chat and rooms platform (the "Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service. Our Privacy Policy explains how we collect and use data.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Eligibility & Accounts</h4>
              <p className="text-muted-foreground">
                You must be legally able to enter into this agreement and, where applicable, meet the minimum age in your jurisdiction. You are responsible for your account activity and for keeping your credentials secure.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Community Standards (Zero Tolerance for Racism)</h4>
              <p className="text-muted-foreground">
                Ember is a respectful space. Harassment, hate, and discrimination are prohibited — racism is not tolerated. Content that attacks or dehumanizes people based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, or other protected characteristics may be removed, and accounts may be restricted or terminated.
              </p>
              <p className="text-muted-foreground mt-2">
                If you encounter abusive behavior, use the report options where available or contact us on Discord.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Post Names & Comment Content</h4>
              <div className="text-muted-foreground space-y-2">
                <p>Post names and comment content are user-generated. You agree to keep post names appropriate and non-offensive. Profanity, slurs, sexual content targeting minors, or attempts to evade filters (e.g., spacing or symbols) are not allowed. We may apply automated or manual moderation, rename or remove posts, and take enforcement action when needed.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>No doxxing, threats, or incitement of violence.</li>
                  <li>No illegal content or instructions to facilitate illegal acts.</li>
                  <li>No spam, scams, or deceptive practices.</li>
                  <li>No explicit sexual content involving minors, ever.</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Your License to Ember</h4>
              <p className="text-muted-foreground">
                You retain ownership of your content. By posting on Ember, you grant us a worldwide, non-exclusive, royalty-free license to host, store, transmit, display, and reproduce your content solely to operate and improve the Service. You represent you have the rights to post what you share.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Moderation & Enforcement</h4>
              <p className="text-muted-foreground">
                We may remove content, restrict features, or suspend/terminate accounts to protect users and the platform, including for violations of these Terms or applicable law. We may also take action to prevent spam and abuse.
              </p>
              <p className="text-muted-foreground mt-2">
                Visible moderation is part of keeping Ember safe. You may see warning labels, removals, or account actions when rules are broken.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Intellectual Property & DMCA</h4>
              <p className="text-muted-foreground">
                Ember and our logos are our IP. Don't misuse our brand. If you believe content on Ember infringes your copyright, contact us with a detailed notice so we can review and respond appropriately.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Prohibited Uses</h4>
              <div className="text-muted-foreground space-y-1">
                <ul className="list-disc list-inside ml-4">
                  <li>Reverse engineering or scraping the Service in violation of our policies.</li>
                  <li>Attempting to bypass security, rate limits, or access controls.</li>
                  <li>Using Ember to send malware, phishing, or other harmful content.</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Disclaimers & Limitation of Liability</h4>
              <p className="text-muted-foreground">
                The Service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, Ember is not liable for indirect, incidental, special, consequential, or punitive damages, or any loss of data, use, or goodwill.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Termination</h4>
              <p className="text-muted-foreground">
                You may stop using Ember at any time. We may suspend or terminate access if you violate these Terms, create risk or legal exposure, or for operational reasons. Certain provisions survive termination, including IP, disclaimers, and limitations of liability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Changes to These Terms</h4>
              <p className="text-muted-foreground">
                We may update these Terms to reflect changes to our Service or for legal/regulatory reasons. If changes are material, we'll provide notice. The "Effective date" at the top shows when they last changed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-muted-foreground">
                Questions about these Terms? Please reach out on our Discord.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button onClick={onAccept} className="min-w-[200px]">
              I Accept the Terms of Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
