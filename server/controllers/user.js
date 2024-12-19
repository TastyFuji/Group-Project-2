exports.listUsers = async (req, res) => {
  try {
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
