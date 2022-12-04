import { DataTable } from "components/shared/DataTable";
import * as styles from "./SongsTable.css";
import { SongDatum, useSongTable } from "./useSongsTable";

export const SongsTable = ({ allSongsData }: { allSongsData: SongDatum[] }) => {
  const { headers, rows, setSearchString } = useSongTable(allSongsData);
  return (
    <div className={styles.container}>
      <h1>All previously submitted songs</h1>
      <input
        placeholder="Search by title, artist or round number"
        className={styles.searchBox}
        onChange={(e) => setSearchString(e.currentTarget.value)}
      />
      <DataTable headers={headers} rows={rows} />
    </div>
  );
};
