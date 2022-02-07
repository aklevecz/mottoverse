export const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY;
// export const MOTTOVERSE_ADDRESS = "0x518D0Dc7019F42b90c3D7128C35E6127cf1C9aB2";
// export const MOTTOVERSE_ADDRESS =
//   process.env.NODE_ENV === "development"
//     ? "0x113Cc0a8c257C4717CE8b9f5B70B71B1e52c7F8d"
//     : "0x579B5027a72f67916A8B5BeC93078B4562f1d993"; // is matic
// export const MOTTOVERSE_ADDRESS = "0xa611Ea6b0c92eFf27485790ce13c4303818beB11";
export const MOTTOVERSE_ADDRESS =
  process.env.NODE_ENV === "development"
    ? "0x3eA6DfB0a7A2324588a40D89F6ec2f2e0a55bEC5"
    : "0x64A169E07dD8c93b251242c1604d37533965397f";

export const colors = {
  red: "#FF3557",
};
