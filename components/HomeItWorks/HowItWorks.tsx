import React from "react";
import { PageContainer } from "../shared/PageContainer/PageContainer";
import * as styles from "./HowItWorks.css";

export const HowItWorks = () => (
  <PageContainer title="How it works">
    <div className={styles.container}>
      <h2>Project Details</h2>
      <p>
        Join in on the musical fun with Everyone Plays the Same Song! This
        covers project invites all participants to record covers of the same
        song. Once the covers are compiled, we can all enjoy comparing different
        interpretations of the same tune. This project aims to promote musical
        education, practice, and community.
      </p>
      <h3>Signup</h3>
      <p>
        {`To join the project, simply fill out the submission form with your name, email address, and the song you'd like to cover. It's that easy!`}
      </p>
      <h3>Song Selection</h3>
      <p>
        {`After song submission closes, all participants will fill out a poll with all submitted songs and their corresponding YouTube links. 
        Participants will rate the songs on a scale of 1 to 5, with 1 being "Definitely don't want to cover" and 5 being "I'm super down to cover this song." 
        Voting a 1 vetoes the song. The survey will also include a question asking how many weeks participants think cover submissions should be due.`}
      </p>
      <h3>Song Submission</h3>
      <p>
        {`A deadline for submissions will be set, and all participants will submit a link to their cover on SoundCloud by that date. 
        The covers will be compiled into a playlist and shared at a post-submission listening party.`}
      </p>
      <h3>Voting Rubric</h3>
      <ol>
        <li>Absolutely not</li>
        <li>{`I'd rather not`}</li>
        <li>Sure</li>
        <li>{`I'd like to cover this`}</li>
        <li>{`I'd REALLY like to cover this`}</li>
      </ol>
      <p>{`Join us and share your musical talents! We can't wait to hear your unique take on the chosen song.`}</p>
    </div>
  </PageContainer>
);
