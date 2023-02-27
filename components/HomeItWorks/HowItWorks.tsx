import { Box, Heading, ListItem, OrderedList, Text } from "@chakra-ui/react";
import { SignupButton } from "components/Homepage/SignupButton";
import React from "react";
import { PageContainer } from "../shared/PageContainer";

export const HowItWorks = () => (
  <PageContainer title="How it works">
    <Box px="16">
      <Heading as="h3" size="lg">
        Project Details
      </Heading>
      <Text pt="3" pb="2" fontWeight="200">
        Join in on the musical fun with Everyone Plays the Same Song! This
        covers project invites all participants to record covers of the same
        song. Once the covers are compiled, we can all enjoy comparing different
        interpretations of the same tune. This project aims to promote musical
        education, practice, and community.
      </Text>
      <Heading as="h3" size="lg">
        Signup
      </Heading>
      <Text pt="3" pb="2" fontWeight="200">
        {`To join the project, simply fill out the submission form with your name, email address, and the song you'd like to cover. It's that easy!`}
      </Text>
      <Heading as="h3">Song Selection</Heading>
      <Text pt="3" pb="2" fontWeight="200">
        {`After song submission closes, all participants will fill out a poll with all submitted songs and their corresponding YouTube links. 
        Participants will rate the songs on a scale of 1 to 5, with 1 being "Definitely don't want to cover" and 5 being "I'm super down to cover this song." 
        Voting a 1 vetoes the song. The survey will also include a question asking how many weeks participants think cover submissions should be due.`}
      </Text>
      <Heading as="h3">Song Submission</Heading>
      <Text pt="3" pb="2" fontWeight="200">
        {`A deadline for submissions will be set, and all participants will submit a link to their cover on SoundCloud by that date. 
        The covers will be compiled into a playlist and shared at a post-submission listening party.`}
      </Text>
      <Heading as="h3">Voting Rubric</Heading>
      <OrderedList fontWeight="200" px="4" pt="3" pb="2">
        <ListItem>Absolutely not</ListItem>
        <ListItem>{`I'd rather not`}</ListItem>
        <ListItem>Sure</ListItem>
        <ListItem>{`I'd like to cover this`}</ListItem>
        <ListItem>{`I'd REALLY like to cover this`}</ListItem>
      </OrderedList>
      <Text fontWeight="700">{`Join us and share your musical talents! We can't wait to hear your unique take on the chosen song.`}</Text>
    </Box>
    <SignupButton />
  </PageContainer>
);
