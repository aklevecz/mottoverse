import { useEffect, useState } from "react";
import styles from "../../styles/Pop.module.css";
import Pick from "./Pick";

enum View {
  PickMotto,
  PlaceMotto,
}

type Props = {
  mottos: any;
  selectedMotto: any;
  setSelectedMotto: any;
  createDraggableMarker: any;
  onPlaceMotto: any;
};

export default function Place({
  mottos,
  selectedMotto,
  setSelectedMotto,
  createDraggableMarker,
  onPlaceMotto,
}: Props) {
  const [view, setView] = useState(View.PickMotto);
  const nextView = () => setView(view + 1);
  useEffect(() => {
    if (view === View.PlaceMotto) {
      createDraggableMarker(selectedMotto);
    }
  }, [view]);
  return (
    <div>
      {view === View.PickMotto && (
        <Pick
          mottos={mottos}
          selectedMotto={selectedMotto}
          setSelectedMotto={setSelectedMotto}
          createDraggableMarker={createDraggableMarker}
          nextView={nextView}
        />
      )}
      {view == View.PlaceMotto && (
        <>
          <div className={styles.cta_bar}>
            Drag your motto where you would like it to be placed
          </div>
          <button
            style={{
              position: "absolute",
              bottom: 10,
              left: "30%",
              zIndex: 3,
              animation: "glimmer 1000ms infinite alternate",
            }}
            onClick={onPlaceMotto}
          >
            Place Motto
          </button>
        </>
      )}
    </div>
  );
}
