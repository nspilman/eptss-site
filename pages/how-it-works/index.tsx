import Head from "next/head";
import React from "react";
import * as styles from "./HowItWorks.styles.css";

const HowItWorks = () => (
  <div className={styles.container}>
    <Head>
      <title>How it works | Everyone Plays the Same Song</title>
    </Head>
    <div className={styles.body}>
      <h2>Project Details</h2>
      <p>
        {`I present, Everyone Plays the Same Song - a covers project. The way it
      works is simple - all participants record covers of the same song. The
      covers are then compiled, and we can enjoy comparing everyone's take. The
      purpose of this project is to promote musical education, practice and
      community -`}
      </p>
      <h3>How Signup Works -</h3>
      <p>
        {`If you want to participate, fill out the submission form with your name,
      email address and at least one song you'd like to cover.`}
      </p>
      <h3>How Song Selection Works -</h3>
      <p>
        {`After song submission closes, all participants will fill out of poll with
      all submitted songs and their corresponding youtube links to listen to.
      Participants will rate the songs 1 to 5 on a scale of "Definitely don't
      want to cover" to "I'm super down to cover this song." Voting a 1 vetos
      the song - which is a valid move if you don't see the song as technically
      possible for you as a musician to pull off. The survey will also include
      the question "In how many weeks should our cover submissions be due?"`}
      </p>
      <h4>
        {`Once results are in, we'll strive to make the most fair selection via the
      following rules -`}
      </h4>
      <ul>
        <li>
          {`If there is a clear favorite that hasn't been vetoed, then that song
        will be chosen.`}
        </li>
        <li>
          {` If there are multiple popular songs without vetos, we will randomly
        choose one of them.`}
        </li>
        <li>
          {`If there are no obvious winners, we will discuss as participants how to
        move forward - allowing discussion of current submissions as well as
        opening the pool back up for new songs.`}
        </li>
      </ul>
      <h4>Vote Rubric | Vote | Significance</h4>
      <ol>
        <li>Absolutely not</li>
        <li> {`I'd rather not`}</li>
        <li>Sure</li>
        <li> {`I'd like to cover this`}</li>
        <li>{`I'd REALLY like to cover this`}</li>
      </ol>
      <h3>How Song Submission works -</h3>
      <p>
        {`We'll decide on a deadline, and all participants will submit a link to
      their cover on soundcloud by that deadline. I'll then publish a playlist
      with everyone's versions, which we'll all listen to together at a
      post-submission listening party. Thanks for being involved, Nate`}
      </p>
    </div>
  </div>
);

export default HowItWorks;
