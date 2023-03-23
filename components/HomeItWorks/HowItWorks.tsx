import {
  Box,
  Container,
  Heading,
  ListItem,
  OrderedList,
  Text,
} from "@chakra-ui/react";
import { SignupButton } from "components/Homepage/SignupButton";
import React from "react";
import { PageContainer } from "components/shared/PageContainer";

export const HowItWorks = () => {
  const contentSections = [
    {
      title: "Project Details",
      body: `Join in on the musical fun with Everyone Plays the Same Song! This
      covers project invites all participants to record covers of the same
      song. Once the covers are compiled, we can all enjoy comparing
      different interpretations of the same tune. This project aims to
      promote musical education, practice, and community.`,
    },
    {
      title: "Signup",
      body: `To join the project, simply fill out the submission form with your name, email address, and the song you'd like to cover. It's that easy!`,
    },
    {
      title: "Song Selection",
      body: `After song submission closes, all participants will fill out a poll with all submitted songs and their corresponding YouTube links. 
          Participants will rate the songs on a scale of 1 to 5, with 1 being "Definitely don't want to cover" and 5 being "I'm super down to cover this song." 
          Voting a 1 vetoes the song. The survey will also include a question asking how many weeks participants think cover submissions should be due.`,
    },
    {
      title: "Song Submission",
      body: `A deadline for submissions will be set, and all participants will submit a link to their cover on SoundCloud by that date. 
      The covers will be compiled into a playlist and shared at a post-submission listening party.`,
    },
  ];
  return (
    <PageContainer title="How it works">
      <>
        <Box px="16">
          {contentSections.map((section) => (
            <Box key={section.title} my="6">
              <Heading as="h3" size="lg">
                {section.title}
              </Heading>
              <Text pt="3" pb="2" fontWeight="200" fontSize="lg">
                {section.body}
              </Text>
            </Box>
          ))}

          <Heading as="h3" size="lg">
            Voting Rubric
          </Heading>
          <OrderedList fontWeight="300" px="4" pt="3" pb="2" fontSize="lg">
            <ListItem>Absolutely not</ListItem>
            <ListItem>{`I'd rather not`}</ListItem>
            <ListItem>Sure</ListItem>
            <ListItem>{`I'd like to cover this`}</ListItem>
            <ListItem>{`I'd REALLY like to cover this`}</ListItem>
          </OrderedList>
          <Text
            my="4"
            fontWeight="700"
          >{`Join us and share your musical talents! We can't wait to hear your unique take on the chosen song.`}</Text>
        </Box>
        <SignupButton />
      </>
    </PageContainer>
  );
};
