import { PageTitle } from "@/components/PageTitle";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


type FAQItems = {
  question: string;
  answer: string;
};

export default function Page() {
  const FAQItems = [
    {
      question: 'What is the "Everyone Plays the Same Song" project?',
      answer:
        'The "Everyone Plays the Same Song" project is a fun community initiative where all participants cover the same song. The project aims to promote musical education, practice, and community by compiling and sharing different interpretations of the same tune.',
    },
    {
      question: "How can I sign up for the project?",
      answer:
        "To join the project, you will need to create an account by providing your email. After creating an account, you can sign up for the currently open round with the song you'd like to cover. If no rounds are open, we'll email you when the next round opens.",
    },
    {
      question: "How is the song for each round selected?",
      answer:
        'After the song submission period closes, a poll will be created with all the submitted songs and their corresponding YouTube links. Participants will rate the songs on a scale of 1 to 5, with 1 being "Definitely don\'t want to cover" and 5 being "I\'m super down to cover this song."',
    },
    {
      question: "How and when do I submit my song cover?",
      answer:
        "You will need to submit a link to your song cover on SoundCloud by the submission deadline, which is set a little over a month from the voting close date. The covers will then be compiled into a playlist and shared at a post-submission listening party.",
    },
    {
      question: "What is the voting rubric for song selection?",
      answer:
        "The voting rubric for song selection is as follows:\n\n1. Absolutely not\n2. I'd rather not\n3. Sure\n4. I'd like to cover this\n5. I'd REALLY like to cover this",
    },
    {
      question: "What platform do I use to submit my cover?",
      answer:
        "You should submit your cover through SoundCloud. After submitting, provide the link to your cover on the project platform.",
    },
    {
      question: "What happens after all the covers are submitted?",
      answer:
        "Once all the covers are submitted and the deadline has passed, we will compile the covers into a playlist. This playlist will then be shared at a post-submission listening party for all participants to enjoy.",
    },
    {
      question: "Do I need any special equipment or software to participate?",
      answer:
        "No, you don't need any special equipment or software to participate. As long as you can record your cover and upload it to SoundCloud, you can join in the fun.",
    },
    {
      question: "Can I participate if I am a beginner or amateur musician?",
      answer:
        "Absolutely! This project is open to musicians of all skill levels. The goal is to promote musical education and practice, and most importantly, to have fun.",
    },
    {
      question: "What if I don't want to participate in a certain round?",
      answer:
        "That's okay! You can choose to participate in the rounds that interest you. The song selection process allows you to vote on which songs you'd like to cover, so you have a say in the final choice.",
    },
  ];

  const mappedFAQItems = FAQItems.map((faq, index) =>{
    return (
      <div 
      key={index}
      className="py-2" >
        <h2 className="text-xl font-bold pb-1"> {faq.question}</h2>
        <p>
          {faq.answer}
        </p>
      </div>
    )
  })
  return (
    
<div className=" w-3/4">
  <Card>
    <CardHeader>
       <p className="font-extrabold text-3xl">Frequently Asked Questions </p>
    </CardHeader>
    <CardContent>
      {mappedFAQItems}
    </CardContent>
  </Card>
</div>

  );
}
