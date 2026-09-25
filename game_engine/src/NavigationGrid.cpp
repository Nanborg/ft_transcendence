#include "NavigationGrid.hpp"
#include <algorithm>
#include <cmath>
#include <limits>
#include <queue>

void NavigationGrid::reset(int scale, int width, int height)
{
    _scale = scale;
    _columns = scale > 0 ? std::max(0, width) / scale : 0;
    _rows = scale > 0 ? std::max(0, height) / scale : 0;
    _walls.assign(static_cast<size_t>(_columns) * _rows, false);
}

bool NavigationGrid::_isOpen(int col, int row) const
{
    return col >= 0 && row >= 0 && col < _columns && row < _rows &&
        !_walls[row * _columns + col];
}

void NavigationGrid::addWall(int x, int y)
{
    if (_scale <= 0 || x < 0 || y < 0)
        return;
    const int col = x / _scale;
    const int row = y / _scale;
    if (col < _columns && row < _rows)
        _walls[row * _columns + col] = true;
}

bool NavigationGrid::canTravel(int fromX, int fromY, int toX, int toY, int size) const
{
    if (_walls.empty())
        return true;
    if (fromX < 0 || fromY < 0 || toX < 0 || toY < 0 ||
        !_isOpen(fromX / _scale, fromY / _scale) ||
        !_isOpen(toX / _scale, toY / _scale))
        return false;

    const double radius = (static_cast<long>(size) + _scale) / 2 - 1;
    const double dx = static_cast<double>(toX) - fromX;
    const double dy = static_cast<double>(toY) - fromY;
    const double length2 = dx * dx + dy * dy;
    const int firstCol = std::max(0, static_cast<int>((std::min(fromX, toX) - radius) / _scale));
    const int lastCol = std::min(_columns - 1, static_cast<int>((std::max(fromX, toX) + radius) / _scale));
    const int firstRow = std::max(0, static_cast<int>((std::min(fromY, toY) - radius) / _scale));
    const int lastRow = std::min(_rows - 1, static_cast<int>((std::max(fromY, toY) + radius) / _scale));
    for (int row = firstRow; row <= lastRow; ++row) {
        for (int col = firstCol; col <= lastCol; ++col) {
            if (!_walls[row * _columns + col])
                continue;
            const double wallX = static_cast<double>(col) * _scale + _scale / 2;
            const double wallY = static_cast<double>(row) * _scale + _scale / 2;
            const double projection = length2 == 0 ? 0 :
                std::max(0.0, std::min(1.0, ((wallX - fromX) * dx + (wallY - fromY) * dy) / length2));
            const double gapX = wallX - fromX - std::trunc(projection * dx);
            const double gapY = wallY - fromY - std::trunc(projection * dy);
            if (gapX * gapX + gapY * gapY < radius * radius)
                return false;
        }
    }
    return true;
}

std::vector<NavigationGrid::Point> NavigationGrid::findPath(
    int fromX, int fromY, int targetX, int targetY, int fleeDistance) const
{
    if (_walls.empty() || fromX < 0 || fromY < 0 || targetX < 0 || targetY < 0)
        return {};
    const int startCol = fromX / _scale;
    const int startRow = fromY / _scale;
    const int goalCol = targetX / _scale;
    const int goalRow = targetY / _scale;
    if (!_isOpen(startCol, startRow) || (fleeDistance == 0 && !_isOpen(goalCol, goalRow)))
        return {};

    const auto heuristic = [&](int col, int row) {
        if (fleeDistance == 0)
            return abs(goalCol - col) + abs(goalRow - row);
        const double distance = std::hypot(static_cast<double>(col) * _scale + _scale / 2 - targetX,
                                          static_cast<double>(row) * _scale + _scale / 2 - targetY);
        return static_cast<int>(std::ceil(std::max(0.0, fleeDistance - distance) / _scale));
    };
    using Entry = std::pair<int, int>;
    std::priority_queue<Entry, std::vector<Entry>, std::greater<Entry>> open;
    std::vector<int> cost(_walls.size(), std::numeric_limits<int>::max());
    std::vector<int> parent(_walls.size(), -1);
    const int start = startRow * _columns + startCol;
    cost[start] = 0;
    open.push({heuristic(startCol, startRow), start});
    const int directions[][2] = {{1, 0}, {0, 1}, {-1, 0}, {0, -1}};
    int expanded = 0;
    while (!open.empty() && expanded < 4096) {
        const Entry entry = open.top();
        open.pop();
        const int current = entry.second;
        const int col = current % _columns;
        const int row = current / _columns;
        if (entry.first != cost[current] + heuristic(col, row))
            continue;
        ++expanded;
        if (heuristic(col, row) == 0) {
            std::vector<Point> path;
            for (int cell = current; cell != -1; cell = parent[cell])
                path.push_back({(cell % _columns) * _scale + _scale / 2,
                                (cell / _columns) * _scale + _scale / 2});
            std::reverse(path.begin(), path.end());
            return path;
        }
        for (const auto& direction : directions) {
            const int nextCol = col + direction[0];
            const int nextRow = row + direction[1];
            if (!_isOpen(nextCol, nextRow))
                continue;
            const int next = nextRow * _columns + nextCol;
            if (cost[next] <= cost[current] + 1)
                continue;
            cost[next] = cost[current] + 1;
            parent[next] = current;
            open.push({cost[next] + heuristic(nextCol, nextRow), next});
        }
    }
    return {};
}
