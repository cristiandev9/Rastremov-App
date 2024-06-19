import { StyleSheet } from "react-native";

export const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonBlock: {
    backgroundColor: "#F15E5E",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonUnblock: {
    backgroundColor: "#000000",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#F1F1F1",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    padding: 5,
    borderRadius: 5,
    top: -20,
    position: "absolute",
    minWidth: 110,
  },
});
