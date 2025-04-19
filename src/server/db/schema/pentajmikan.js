/**
 * Schema for the pentajmikan table
 * Represents a program that users can create and participate in
 */
export const pentajmikanTableSchema = `
CREATE TABLE IF NOT EXISTS pentajmikan (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_participants INT DEFAULT 0,
  date DATETIME NOT NULL,
  niche VARCHAR(255),
  image_id INT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (image_id) REFERENCES uploads(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pentajmikan_participants (
  id INT NOT NULL AUTO_INCREMENT,
  pentajmikan_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_participation (pentajmikan_id, user_id),
  FOREIGN KEY (pentajmikan_id) REFERENCES pentajmikan(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;
