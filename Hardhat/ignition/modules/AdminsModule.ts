import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AdminsModule = buildModule("AdminsModule", (m) => {
  // No constructor params needed anymore
  const admins = m.contract("Admins"); // ✅ No args here

  return { admins };
});

export default AdminsModule;
