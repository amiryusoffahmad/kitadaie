/**
 * Color scheme for 16 CCS clusters
 * Using distinct, accessible colors for data visualization
 */

export const CLUSTER_COLORS = {
  "1. Keluarga": "#FF6B6B", // Red
  "2. Ekonomi": "#4ECDC4", // Teal
  "3. Jemaah": "#45B7D1", // Blue
  "4. Kawan-kawan": "#96CEB4", // Green
  "5. Akademik/Pekerjaan": "#FFEAA7", // Yellow
  "6. Jawatan/Rumah/Cuti": "#DFE6E9", // Light Gray
  "7. Emosi/Jiwa/Perasaan": "#74B9FF", // Sky Blue
  "8. Pengurusan Diri & Amanah": "#FD79A8", // Pink
  "9. Karat-karat jahiliah (KKJ)": "#A29BFE", // Purple
  "10. Sikap/Kesungguhan": "#55EFC4", // Mint
  "11. IQ/Personaliti": "#FF7675", // Coral
  "12. Fitnah": "#FDA7DF", // Light Pink
  "13. Adab/Ketsiqohan": "#FDCB6E", // Orange
  "14. Negeri": "#6C5CE7", // Indigo
  "15. Kesihatan/Mental/Saka": "#E17055", // Terracotta
  "16. Manja": "#B2BEC3", // Gray
};

/**
 * Get color for a specific cluster
 * @param {string} clusterName - Name of the cluster
 * @returns {string} Hex color code
 */
export function getClusterColor(clusterName) {
  return CLUSTER_COLORS[clusterName] || "#95A5A6"; // Default gray
}

/**
 * Get clean cluster label (removes number prefix)
 * @param {string} clusterName - Full cluster name with number
 * @returns {string} Clean label without number
 */
export function getClusterLabel(clusterName) {
  if (!clusterName) return "";
  // Remove "1. " or "10. " prefix
  return clusterName.replace(/^\d+\.\s*/, "");
}

/**
 * Get array of colors for all clusters (useful for Recharts)
 * @returns {Array<{name: string, color: string}>}
 */
export function getClusterColorsArray() {
  return Object.entries(CLUSTER_COLORS).map(([name, color]) => ({
    name,
    color,
  }));
}

/**
 * Get color by cluster index (0-15)
 * @param {number} index - Cluster index
 * @returns {string} Hex color code
 */
export function getClusterColorByIndex(index) {
  const clusters = Object.values(CLUSTER_COLORS);
  return clusters[index] || "#95A5A6";
}
