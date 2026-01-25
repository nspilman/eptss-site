#!/usr/bin/env bun
/**
 * Migration script to populate the slug field for existing rounds
 * based on the votingOpens date in YYYY-MM-DD format.
 * 
 * Run with: bun scripts/populate-round-slugs.ts
 */

import { db, roundMetadata, eq } from "@eptss/db";

async function populateRoundSlugs() {
  console.log("Starting round slug population...");

  try {
    // Get all rounds that don't have a slug yet
    const rounds = await db
      .select({
        id: roundMetadata.id,
        votingOpens: roundMetadata.votingOpens,
        slug: roundMetadata.slug,
      })
      .from(roundMetadata)
      .orderBy(roundMetadata.id);

    console.log(`Found ${rounds.length} rounds to process`);

    // Process each round
    for (const round of rounds) {
      // Skip rounds that already have a slug
      if (round.slug) {
        console.log(`Round ${round.id} already has slug: ${round.slug}`);
        continue;
      }

      // Generate slug based on votingOpens date
      let slug = "";
      if (round.votingOpens) {
        const date = new Date(round.votingOpens);
        slug = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else {
        // Fallback for rounds without votingOpens date
        slug = `round-${round.id}`;
      }

      // Make sure the slug is unique by appending the round ID if needed
      const existingWithSlug = await db
        .select({ id: roundMetadata.id })
        .from(roundMetadata)
        .where(eq(roundMetadata.slug, slug));

      if (existingWithSlug.length > 0) {
        slug = `${slug}-${round.id}`;
      }

      // Update the round with the new slug
      await db
        .update(roundMetadata)
        .set({ slug })
        .where(eq(roundMetadata.id, round.id));

      console.log(`Updated round ${round.id} with slug: ${slug}`);
    }

    console.log("Round slug population completed successfully!");
  } catch (error) {
    console.error("Error populating round slugs:", error);
    process.exit(1);
  }
}

// Run the migration
populateRoundSlugs().then(() => process.exit(0));
