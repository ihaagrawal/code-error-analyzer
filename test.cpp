#include <iostream>
using namespace std;
int main() {
    int* ptr = malloc(sizeof(int));
    free(ptr);
    return 0;
}