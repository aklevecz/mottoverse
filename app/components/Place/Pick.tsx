import styles from "../../styles/Place.module.css";

type Props = {
  mottos: any;
  selectedMotto: any;
  setSelectedMotto: any;
  createDraggableMarker: any;
  nextView: any;
};

export default function Pick({
  mottos,
  selectedMotto,
  setSelectedMotto,
  createDraggableMarker,
  nextView,
}: Props) {
  return (
    <>
      <div className={styles.ui}>
        <div className={styles.mottos}>
          <div>Pick a Motto</div>
          {mottos &&
            mottos.map((motto: any) => {
              return (
                <div
                  key={`${motto.name}`}
                  className={`${
                    selectedMotto === motto.tokenId ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedMotto(motto.tokenId);
                  }}
                >
                  {motto.name}
                </div>
              );
            })}
          {selectedMotto ? <div onClick={nextView}>Continue</div> : ""}
        </div>
      </div>
    </>
  );
}
