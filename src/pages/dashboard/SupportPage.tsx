import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Phone } from 'lucide-react';
const faqs = [
  {
    question: "How do I change my profile picture?",
    answer: "Navigate to the 'Profile' section from the dashboard sidebar. There you will find an option to upload a new image from your device."
  },
  {
    question: "How can I save an article or project for later?",
    answer: "On any public directory page (Publications, Projects, etc.), you will see a bookmark icon on each item card. Click it to save the item to your dashboard."
  },
  {
    question: "I forgot my password. What should I do?",
    answer: "On the login page, there is a 'Forgot Password' link. Follow the instructions to reset your password via email. If you still have trouble, please contact support."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security very seriously. Please refer to our Privacy Policy for detailed information on how we protect your data."
  }
];
export function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Here are some of the most common questions we receive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>
            If you can't find the answer you're looking for, feel free to reach out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Support</p>
              <a href="mailto:support@scholarsphere.com" className="text-sm text-primary hover:underline">
                support@scholarsphere.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone Support</p>
              <p className="text-sm text-muted-foreground">(555) 123-4567</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}