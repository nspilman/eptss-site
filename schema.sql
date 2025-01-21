--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: round_type_override; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.round_type_override AS ENUM (
    'runner_up'
);


--
-- Name: TYPE round_type_override; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.round_type_override IS 'available round type overrides ';


--
-- Name: create_username(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_username() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    adjectives TEXT[] := ARRAY['Melodic', 'Harmonic', 'Rhythmic', 'Dynamic', 'Sonorous', 'Resonant', 'Lyrical', 'Tonal', 'Euphonic', 'Consonant', 'Dissonant', 'Polyphonic', 'Timbral', 'Chromatic', 'Diatonic', 'Syncopated', 'Modal', 'Cadential', 'Legato', 'Staccato','Pizzicato', 'Vibrato', 'Fortissimo', 'Pianissimo', 'Glissando', 'Sforzando', 'Adagio', 'Allegro', 'Presto', 'Andante', 'Crescendo', 'Decrescendo', 'Fugue', 'Arpeggiated', 'Maestoso', 'Dolce', 'Marcato', 'Rubato', 'Subito', 'Tutti', 'Vivo', 'Motivic', 'Ornamental', 'Rallentando'];

    animals TEXT[] := ARRAY['Crocodile', 'Elephant', 'Tiger', 'Penguin', 'Lion', 'Giraffe', 'Kangaroo', 'Falcon'];
    rand_adj TEXT;
    rand_animal TEXT;
    rand_num INTEGER;
BEGIN
    -- Randomly select a musical adjective
    rand_adj := adjectives[1 + random()*(array_length(adjectives, 1) - 1)::INT];

    -- Randomly select an animal
    rand_animal := animals[1 + random()*(array_length(animals, 1) - 1)::INT];

    -- Randomly generate a number between 1 and 99
    rand_num := 1 + random()*99::INT;

    RETURN rand_adj || rand_animal || rand_num::TEXT;
END;
$$;


--
-- Name: get_current_round(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_round() RETURNS bigint
    LANGUAGE plpgsql
    AS $$declare
  current_round_id int8;
begin
  -- Select the rounds from round_metadata table
select
  id
from
  round_metadata
  -- Filter the rounds where today's date falls between signup_open and listening_party dates
where
  current_date between signup_opens and listening_party
  order by voting_opens asc limit 1 into current_round_id;
  return current_round_id;
end;$$;


--
-- Name: get_is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_is_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    select exists (
        select 1
        from user_roles
        where user_roles.user_id = auth.uid() and user_roles.admin_level = 1
    )
$$;


--
-- Name: get_outstanding_voters(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_outstanding_voters() RETURNS TABLE(email text)
    LANGUAGE plpgsql
    AS $$
begin
return QUERY SELECT sign_ups.email from sign_ups where sign_ups.round_id = get_current_round() and lower(sign_ups.email) not in (select lower(submitter_email) from song_selection_votes where round_id = get_current_round());
end;
$$;


--
-- Name: get_user_submissions_by_permissions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_submissions_by_permissions() RETURNS TABLE(round_id bigint, soundcloud_url text, created_at timestamp with time zone, title text, artist text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT s.round_id, s.soundcloud_url, s.created_at,songs.title, songs.artist
    FROM user_share_permissions usp
    JOIN submissions s ON usp.user_id = s.user_id
    JOIN round_metadata r ON s.round_id = r.id
    JOIN songs ON songs.id = r.song_id
    WHERE usp.can_share_bsky = true;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$BEGIN
  -- Insert into your custom users table
  INSERT INTO public.users (userId, email, username)
  VALUES (NEW.id, NEW.email, public.create_username());
  RETURN NEW;
END;
$$;


--
-- Name: signup(text, text, text, bigint, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.signup(song_title text, artist_name text, additional_comments text, round_id bigint, user_id text, youtube_link text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare id_of_submitted_song int8;
  begin
  SELECT Cast(id as int8)
  into id_of_submitted_song
    FROM songs 
   WHERE lower(songs.artist) = lower(artist_name) and lower(songs.title) = lower(song_title);
   IF NOT FOUND
  THEN
  insert into songs(title, artist) values(song_title, artist_name)
returning id INTO id_of_submitted_song;
  END IF;

  INSERT INTO sign_ups(youtube_link, additional_comments, round_id, song_id, user_id) values(
    youtube_link, additional_comments, round_id, id_of_submitted_song, Cast(user_id as uuid)
  );
end;
$$;


--
-- Name: update_user_metadata(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_metadata() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update the user_metadata in the auth.users table
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'), '{username}', to_jsonb(NEW.username))
  WHERE id = NEW.userId;

  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: round_voting_candidate_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.round_voting_candidate_overrides (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    round_id bigint,
    song_id bigint,
    original_round_id bigint
);


--
-- Name: TABLE round_voting_candidate_overrides; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.round_voting_candidate_overrides IS 'This table holds the voting candidate overrides for rounds that do not take end user signup song suggests as candidates';


--
-- Name: legacy_round_voting_candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.round_voting_candidate_overrides ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.legacy_round_voting_candidates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mailing_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailing_list (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    email text NOT NULL,
    additional_comments text
);


--
-- Name: mailing_list_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.mailing_list ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mailing_list_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mailing_list_unsubscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mailing_list_unsubscription (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    email text NOT NULL,
    user_id uuid
);


--
-- Name: mailing_list_unsubscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.mailing_list_unsubscription ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mailing_list_unsubscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    userid uuid NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    username text,
    admin_level integer
);


--
-- Name: COLUMN users.admin_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.admin_level IS 'admin level';


--
-- Name: mailinglist; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.mailinglist AS
 SELECT users.email
   FROM (public.users
     LEFT JOIN public.mailing_list_unsubscription ON ((users.userid = mailing_list_unsubscription.user_id)))
  WHERE (mailing_list_unsubscription.user_id IS NULL);


--
-- Name: sign_ups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sign_ups (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    youtube_link text NOT NULL,
    additional_comments text,
    round_id bigint NOT NULL,
    song_id bigint,
    user_id uuid NOT NULL
);


--
-- Name: public_signups; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.public_signups AS
 SELECT sign_ups.created_at,
    users.username,
    sign_ups.round_id
   FROM (public.sign_ups
     JOIN public.users ON ((sign_ups.user_id = users.userid)))
  ORDER BY sign_ups.created_at DESC;


--
-- Name: round_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.round_metadata (
    id bigint NOT NULL,
    playlist_url text,
    song_id bigint,
    created_at timestamp with time zone DEFAULT now(),
    signup_opens timestamp with time zone,
    voting_opens timestamp with time zone,
    covering_begins timestamp with time zone,
    covers_due timestamp with time zone,
    listening_party timestamp with time zone,
    round_type_override public.round_type_override
);


--
-- Name: COLUMN round_metadata.round_type_override; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.round_metadata.round_type_override IS 'This column is used when the round is not the standard - ex. runner up round';


--
-- Name: songs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.songs (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    title text NOT NULL,
    artist text NOT NULL
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    soundcloud_url text NOT NULL,
    round_id bigint NOT NULL,
    additional_comments text,
    user_id uuid NOT NULL
);


--
-- Name: public_submissions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.public_submissions AS
 SELECT users.username,
    submissions.round_id,
    submissions.created_at,
    songs.title,
    songs.artist,
    submissions.soundcloud_url
   FROM (((public.submissions
     JOIN public.round_metadata ON ((round_metadata.id = submissions.round_id)))
     JOIN public.songs ON ((round_metadata.song_id = songs.id)))
     JOIN public.users ON ((users.userid = submissions.user_id)));


--
-- Name: round_metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.round_metadata ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.round_metadata_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sign_ups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sign_ups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.sign_ups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: signups; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.signups AS
 SELECT sign_ups.created_at,
    sign_ups.youtube_link,
    users.username,
    songs.id,
    songs.title,
    songs.artist,
    sign_ups.round_id
   FROM ((public.sign_ups
     JOIN public.songs ON ((sign_ups.song_id = songs.id)))
     JOIN public.users ON ((sign_ups.user_id = users.userid)))
  ORDER BY sign_ups.created_at DESC;


--
-- Name: song_selection_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.song_selection_votes (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    song_id bigint NOT NULL,
    vote smallint NOT NULL,
    submitter_email text,
    round_id bigint NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: song_selection_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.song_selection_votes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.song_selection_votes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: songs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.songs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.songs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.submissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: submissions_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.submissions_view AS
 SELECT users.email,
    submissions.round_id,
    songs.title,
    songs.artist,
    submissions.soundcloud_url,
    submissions.user_id
   FROM (((public.submissions
     JOIN public.round_metadata ON ((round_metadata.id = submissions.round_id)))
     JOIN public.songs ON ((round_metadata.song_id = songs.id)))
     JOIN public.users ON ((users.userid = submissions.user_id)));


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    admin_level integer NOT NULL
);


--
-- Name: TABLE user_roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_roles IS 'admins';


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_share_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_share_permissions (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    can_share_bsky boolean NOT NULL
);


--
-- Name: user_share_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_share_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_share_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vote_results; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vote_results AS
 SELECT songs.id,
    songs.title,
    songs.artist,
    round(avg(song_selection_votes.vote), 2) AS average,
    song_selection_votes.round_id,
    count(DISTINCT song_selection_votes.user_id) AS votes_count
   FROM (public.song_selection_votes
     JOIN public.songs ON ((song_selection_votes.song_id = songs.id)))
  GROUP BY songs.title, songs.id, songs.artist, song_selection_votes.round_id
  ORDER BY (avg(song_selection_votes.vote)) DESC;


--
-- Name: vote_breakdown_by_song; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vote_breakdown_by_song AS
 SELECT origin_table.round_id,
    origin_table.song_id,
    songs.title,
    songs.artist,
    vote_results.average,
    ( SELECT count(song_selection_votes.vote) AS count
           FROM public.song_selection_votes
          WHERE ((song_selection_votes.vote = 5) AND (song_selection_votes.song_id = origin_table.song_id) AND (song_selection_votes.round_id = origin_table.round_id))) AS five_count,
    ( SELECT count(song_selection_votes.vote) AS count
           FROM public.song_selection_votes
          WHERE ((song_selection_votes.vote = 4) AND (song_selection_votes.song_id = origin_table.song_id) AND (song_selection_votes.round_id = origin_table.round_id))) AS four_count,
    ( SELECT count(song_selection_votes.vote) AS count
           FROM public.song_selection_votes
          WHERE ((song_selection_votes.vote = 3) AND (song_selection_votes.song_id = origin_table.song_id) AND (song_selection_votes.round_id = origin_table.round_id))) AS three_count,
    ( SELECT count(song_selection_votes.vote) AS count
           FROM public.song_selection_votes
          WHERE ((song_selection_votes.vote = 2) AND (song_selection_votes.song_id = origin_table.song_id) AND (song_selection_votes.round_id = origin_table.round_id))) AS two_count,
    ( SELECT count(song_selection_votes.vote) AS count
           FROM public.song_selection_votes
          WHERE ((song_selection_votes.vote = 1) AND (song_selection_votes.song_id = origin_table.song_id) AND (song_selection_votes.round_id = origin_table.round_id))) AS one_count
   FROM ((public.song_selection_votes origin_table
     JOIN public.songs ON ((origin_table.song_id = songs.id)))
     JOIN public.vote_results ON (((origin_table.round_id = vote_results.round_id) AND (origin_table.song_id = vote_results.id))))
  GROUP BY origin_table.song_id, songs.title, songs.artist, origin_table.round_id, vote_results.average
  ORDER BY origin_table.round_id, vote_results.average DESC;


--
-- Name: votes_diff_with_average; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.votes_diff_with_average AS
 SELECT vote_results.artist,
    vote_results.title,
    vote_results.average,
    vote_results.id,
    vote_results.round_id,
    song_selection_votes.submitter_email AS email,
    song_selection_votes.vote,
    song_selection_votes.user_id
   FROM (public.song_selection_votes
     JOIN public.vote_results ON (((song_selection_votes.song_id = vote_results.id) AND (song_selection_votes.round_id = vote_results.round_id))));


--
-- Name: round_voting_candidate_overrides legacy_round_voting_candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_voting_candidate_overrides
    ADD CONSTRAINT legacy_round_voting_candidates_pkey PRIMARY KEY (id);


--
-- Name: mailing_list mailing_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailing_list
    ADD CONSTRAINT mailing_list_pkey PRIMARY KEY (id);


--
-- Name: mailing_list_unsubscription mailing_list_unsubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mailing_list_unsubscription
    ADD CONSTRAINT mailing_list_unsubscription_pkey PRIMARY KEY (id);


--
-- Name: round_metadata round_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_metadata
    ADD CONSTRAINT round_metadata_pkey PRIMARY KEY (id);


--
-- Name: sign_ups sign_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_ups
    ADD CONSTRAINT sign_ups_pkey PRIMARY KEY (id);


--
-- Name: song_selection_votes song_selection_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_selection_votes
    ADD CONSTRAINT song_selection_votes_pkey PRIMARY KEY (id);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_share_permissions user_share_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_share_permissions
    ADD CONSTRAINT user_share_permissions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: users users_userid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_userid_key UNIQUE (userid);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users update_username_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_username_trigger AFTER UPDATE OF username ON public.users FOR EACH ROW WHEN ((old.username IS DISTINCT FROM new.username)) EXECUTE FUNCTION public.update_user_metadata();

ALTER TABLE public.users DISABLE TRIGGER update_username_trigger;


--
-- Name: round_metadata round_metadata_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_metadata
    ADD CONSTRAINT round_metadata_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id);


--
-- Name: round_voting_candidate_overrides round_voting_candidate_overrides_original_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_voting_candidate_overrides
    ADD CONSTRAINT round_voting_candidate_overrides_original_round_id_fkey FOREIGN KEY (original_round_id) REFERENCES public.round_metadata(id);


--
-- Name: round_voting_candidate_overrides round_voting_candidate_overrides_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_voting_candidate_overrides
    ADD CONSTRAINT round_voting_candidate_overrides_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.round_metadata(id);


--
-- Name: round_voting_candidate_overrides round_voting_candidate_overrides_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_voting_candidate_overrides
    ADD CONSTRAINT round_voting_candidate_overrides_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id);


--
-- Name: sign_ups sign_ups_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_ups
    ADD CONSTRAINT sign_ups_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id);


--
-- Name: sign_ups sign_ups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sign_ups
    ADD CONSTRAINT sign_ups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid);


--
-- Name: song_selection_votes song_selection_votes_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_selection_votes
    ADD CONSTRAINT song_selection_votes_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id);


--
-- Name: song_selection_votes song_selection_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_selection_votes
    ADD CONSTRAINT song_selection_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid);


--
-- Name: submissions submissions_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.round_metadata(id);


--
-- Name: submissions submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid);


--
-- Name: user_share_permissions user_share_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_share_permissions
    ADD CONSTRAINT user_share_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_userid_fkey FOREIGN KEY (userid) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: songs Enable insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert" ON public.songs FOR INSERT WITH CHECK (true);


--
-- Name: sign_ups Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.sign_ups FOR INSERT WITH CHECK (true);


--
-- Name: song_selection_votes Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.song_selection_votes FOR INSERT WITH CHECK (true);


--
-- Name: submissions Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.submissions FOR INSERT WITH CHECK (true);


--
-- Name: users Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: round_metadata Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.round_metadata FOR SELECT USING (true);


--
-- Name: round_voting_candidate_overrides Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.round_voting_candidate_overrides FOR SELECT USING (true);


--
-- Name: sign_ups Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.sign_ups FOR SELECT USING (true);


--
-- Name: song_selection_votes Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.song_selection_votes FOR SELECT USING (true);


--
-- Name: songs Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.songs FOR SELECT USING (true);


--
-- Name: submissions Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.submissions FOR SELECT USING (true);


--
-- Name: users Users can update their own rows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own rows" ON public.users FOR UPDATE TO authenticated USING ((auth.uid() = userid));


--
-- Name: users admins_see_all_data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_see_all_data ON public.users FOR SELECT USING (public.get_is_admin());


--
-- Name: mailing_list everyone can sign up for the waitlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "everyone can sign up for the waitlist" ON public.mailing_list FOR INSERT WITH CHECK (true);


--
-- Name: mailing_list; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mailing_list ENABLE ROW LEVEL SECURITY;

--
-- Name: mailing_list_unsubscription; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mailing_list_unsubscription ENABLE ROW LEVEL SECURITY;

--
-- Name: round_metadata; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.round_metadata ENABLE ROW LEVEL SECURITY;

--
-- Name: round_voting_candidate_overrides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.round_voting_candidate_overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: sign_ups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sign_ups ENABLE ROW LEVEL SECURITY;

--
-- Name: song_selection_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.song_selection_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: songs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

--
-- Name: submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_share_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_share_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

