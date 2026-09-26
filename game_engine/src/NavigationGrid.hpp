#ifndef NAVIGATIONGRID_HPP
#define NAVIGATIONGRID_HPP

#include <utility>
#include <vector>

class NavigationGrid
{
public:
    using Point = std::pair<int, int>;

    void reset(int scale, int width, int height);
    void addWall(int x, int y);
    bool canTravel(int fromX, int fromY, int toX, int toY, int size) const;
    std::vector<Point> findPath(int fromX, int fromY, int targetX, int targetY,
                               int fleeDistance = 0) const;

private:
    bool _isOpen(int col, int row) const;
    int _scale = 0;
    int _columns = 0;
    int _rows = 0;
    std::vector<bool> _walls;
};

#endif
